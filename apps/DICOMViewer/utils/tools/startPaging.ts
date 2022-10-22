import type { Viewport } from '../../models/Viewport';
import { V } from '../math/Vector';

const PAGING_SENSIBILITY = 1.2;

export function startPaging(
  viewport: Viewport,
  downEvent: MouseEvent
): (moveEvent: MouseEvent) => void {
  const startY = downEvent.clientY;
  const { camera } = viewport;

  const direction = camera.getDirection();
  const startLookPoint = camera.lookPoint;
  let currentLookPoint = camera.lookPoint;

  const { max, min } = viewport.dataset.getLimitsAlongAxe(direction);

  const correctLookPoint = (point: number[]) => {
    const correctionVectorNorm = V(point).sub(camera.lookPoint).dot(direction);
    const correctionVector = V(direction).mul(correctionVectorNorm);
    return V(camera.lookPoint).add(correctionVector) as number[];
  };

  return (moveEvent: MouseEvent) => {
    const sensitivity =
      ((max.positionOnAxe - min.positionOnAxe) / viewport.height) *
      PAGING_SENSIBILITY;
    const deltaPosition = (startY - moveEvent.clientY) * sensitivity;
    let newLookPoint: number[] = V(startLookPoint).add(
      V(direction).mul(deltaPosition)
    );
    const positionOnDirection = V(newLookPoint).dot(direction);

    if (positionOnDirection < min.positionOnAxe) {
      newLookPoint = correctLookPoint(min.point);
    } else if (positionOnDirection > max.positionOnAxe) {
      newLookPoint = correctLookPoint(max.point);
    }

    if (V(newLookPoint).distance(currentLookPoint) > Number.EPSILON) {
      camera.lookPoint = newLookPoint;
      camera.eyePoint = V(camera.lookPoint).sub(direction);
      currentLookPoint = newLookPoint;
    }
  };
}
