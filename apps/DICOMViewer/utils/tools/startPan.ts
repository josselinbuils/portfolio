import { Viewport } from '../../models/Viewport';
import { Volume } from '../../models/Volume';
import { changePointSpace } from '../../utils/changePointSpace';
import { V } from '../math/Vector';
import { isImageCentered } from './utils/isImageCentered';

export function startPan(
  viewport: Viewport,
  downEvent: MouseEvent
): (moveEvent: MouseEvent) => void {
  const { camera, dataset } = viewport;
  const cursorStartPosition = [downEvent.clientX, downEvent.clientY, 0];
  const direction = camera.getDirection();
  const startLookPoint = camera.lookPoint;

  return (moveEvent: MouseEvent) => {
    const baseCenter = dataset.is3D
      ? (dataset.volume as Volume).center
      : dataset.frames[0].imageCenter;
    const baseCenterViewport = [
      ...changePointSpace(baseCenter, dataset, viewport).slice(0, 2),
      0,
    ];
    const startLookPointViewport = changePointSpace(
      startLookPoint,
      dataset,
      viewport
    );
    const newLookPointViewport = [
      startLookPointViewport[0] + cursorStartPosition[0] - moveEvent.clientX,
      startLookPointViewport[1] + cursorStartPosition[1] - moveEvent.clientY,
      0,
    ];
    const isCentered = isImageCentered(
      viewport,
      baseCenterViewport,
      newLookPointViewport
    );

    camera.lookPoint = changePointSpace(
      isCentered ? baseCenterViewport : newLookPointViewport,
      viewport,
      dataset
    );
    camera.eyePoint = V(camera.lookPoint).sub(direction);
  };
}
