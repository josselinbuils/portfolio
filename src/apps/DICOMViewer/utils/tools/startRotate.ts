import { type Camera } from '../../models/Camera';
import { type Viewport } from '../../models/Viewport';
import { areFloatEquals } from '../areFloatEquals';
import { changePointSpace } from '../changePointSpace';
import { M3 } from '../math/Matrix3';
import { V } from '../math/Vector';

export function startRotate(
  viewport: Viewport,
  downEvent: MouseEvent,
  onRotate: () => void,
): (moveEvent: MouseEvent) => void {
  if (!viewport.dataset.is3D) {
    throw new Error('Unable to rotate on a 2D dataset');
  }

  const { height, width } = viewport;
  const imageCenter = changePointSpace(
    viewport.dataset.volume!.center,
    viewport.dataset,
    viewport,
  );

  imageCenter[2] = 0; // We want the point to be on the viewport

  const trackballRadius = Math.min(width, height) / 2;
  const cursorStartPosition = [downEvent.offsetX, downEvent.offsetY, 0];
  const left = downEvent.clientX - downEvent.offsetX;
  const top = downEvent.clientY - downEvent.offsetY;
  let previousVector = computeTrackball(
    imageCenter,
    trackballRadius,
    cursorStartPosition,
  );

  return (moveEvent: MouseEvent) => {
    const cursorOffset = [moveEvent.clientX - left, moveEvent.clientY - top, 0];
    const currentVector = computeTrackball(
      imageCenter,
      trackballRadius,
      cursorOffset,
    );

    if (V(currentVector).equals(previousVector)) {
      return;
    }

    const { angle, axis } = computeRotation(previousVector, currentVector);
    const { camera, dataset } = viewport;
    const volume = dataset.volume!;

    let direction = camera.getDirection();

    // Centers the volume on the viewport
    if (viewport.is3D()) {
      camera.lookPoint = volume.center.slice();
      camera.eyePoint = V(camera.lookPoint).sub(direction);
    } else {
      camera.lookPoint = changePointSpace(imageCenter, viewport, dataset);
      camera.eyePoint = V(camera.lookPoint).sub(direction);
    }

    rotateCamera(camera, axis, angle);

    direction = camera.getDirection();

    // Applies the initial pan again
    camera.lookPoint = changePointSpace(
      [viewport.width - imageCenter[0], viewport.height - imageCenter[1], 0],
      viewport,
      dataset,
    );

    if (viewport.is3D()) {
      // Puts the look point on the periphery of the volume
      const correctionVector = V(direction).scale(
        -volume.getOrientedDimensionMm(direction) / 2,
      );
      camera.lookPoint = V(camera.lookPoint).add(correctionVector).smooth();
    }

    camera.eyePoint = V(camera.lookPoint).sub(direction);
    camera.baseFieldOfView = volume.getOrientedDimensionMm(camera.upVector);

    previousVector = currentVector;

    onRotate();
  };
}

function computeRotation(
  previous: number[],
  current: number[],
): { angle: number; axis: number[] } {
  const axis = V(current).cross(previous).normalize();
  const angle = V(previous).angle(current);
  return { axis, angle };
}

function computeTrackball(
  center: number[],
  radius: number,
  cursorOffset: number[],
): number[] {
  const fromCenter = V(cursorOffset).sub(center);
  const fromCenterNorm = V(fromCenter).norm();

  // fromCenter cannot be longer than the trackball radius
  if (fromCenterNorm > radius) {
    fromCenter.scale(radius / fromCenterNorm);
  }

  const fromCenterNormSquared = V(fromCenter).dot(fromCenter);
  const radiusSquared = radius ** 2;

  fromCenter[2] = !areFloatEquals(fromCenterNormSquared, radiusSquared)
    ? -Math.sqrt(radiusSquared - fromCenterNormSquared)
    : 0;

  return fromCenter;
}

function rotateCamera(camera: Camera, axis: number[], angle: number): void {
  const newCameraBasis = M3(camera.getWorldBasis())
    .transpose()
    .mulMat(computeRotationMatrix(axis, angle))
    .transpose();

  camera.eyePoint = V(camera.lookPoint).sub(V(newCameraBasis[2]).normalize());
  camera.upVector = V(newCameraBasis[1]).neg().normalize();
}

function computeRotationMatrix(axis: number[], angle: number): number[][] {
  const [x, y, z] = axis;
  const cos = Math.cos(angle);
  const invCos = 1 - cos;
  const sin = Math.sin(angle);
  return [
    [cos + x * x * invCos, x * y * invCos - z * sin, x * z * invCos + y * sin],
    [y * x * invCos + z * sin, cos + y * y * invCos, y * z * invCos - x * sin],
    [z * x * invCos - y * sin, z * y * invCos + x * sin, cos + z * z * invCos],
  ];
}
