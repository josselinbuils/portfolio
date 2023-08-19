import { ViewType } from '../../constants';
import { type Camera } from '../../models/Camera';
import { type Viewport } from '../../models/Viewport';
import { type Volume } from '../../models/Volume';
import { areFloatEquals } from '../areFloatEquals';
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
  const trackballCenter = [width / 2, height / 2];
  const trackballRadius = Math.min(width, height) / 2;
  const cursorStartPosition = [downEvent.offsetX, downEvent.offsetY];
  const left = downEvent.clientX - downEvent.offsetX;
  const top = downEvent.clientY - downEvent.offsetY;
  let previousVector = computeTrackball(
    trackballCenter,
    trackballRadius,
    cursorStartPosition,
  );

  return (moveEvent: MouseEvent) => {
    const cursorOffset = [moveEvent.clientX - left, moveEvent.clientY - top];
    const currentVector = computeTrackball(
      trackballCenter,
      trackballRadius,
      cursorOffset,
    );

    if (V(currentVector).equals(previousVector)) {
      return;
    }

    const { angle, axis } = computeRotation(previousVector, currentVector);
    const { camera } = viewport;

    if (
      [ViewType.VolumeBones, ViewType.VolumeSkin].includes(viewport.viewType)
    ) {
      const { orientedDimensionsMm } = viewport.dataset.volume!;
      let direction = camera.getDirection();
      let correctionVector = V(direction).mul(-camera.depthOfField / 2);

      camera.lookPoint = V(camera.lookPoint).sub(correctionVector);
      camera.eyePoint = V(camera.lookPoint).sub(direction);

      rotateCamera(camera, axis, angle);

      direction = camera.getDirection();

      camera.depthOfField =
        V(M3(orientedDimensionsMm).mulVec(direction)).norm() * 1.2; // TODO find why we need this correction factor

      correctionVector = V(direction).mul(-camera.depthOfField / 2);

      camera.lookPoint = V(camera.lookPoint).add(correctionVector).smooth();
      camera.eyePoint = V(camera.lookPoint).sub(direction);
    } else {
      rotateCamera(camera, axis, angle);
    }

    camera.baseFieldOfView = (
      viewport.dataset.volume as Volume
    ).getOrientedDimensionMm(camera.upVector);

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
  const fromCenter = V([...cursorOffset, 0]).sub([...center, 0]);
  const fromCenterNorm = V(fromCenter).norm();

  // fromCenter cannot be longer than the trackball radius
  if (fromCenterNorm > radius) {
    fromCenter.mul(radius / fromCenterNorm);
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
