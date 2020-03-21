import { Viewport, Volume } from '../../models';
import { Coordinates } from '../Coordinates';
import { V } from '../math';
import { isCentered } from './utils';

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
      ...Coordinates.convert(baseCenter, dataset, viewport).slice(0, 2),
      0
    ];
    const startLookPointViewport = Coordinates.convert(
      startLookPoint,
      dataset,
      viewport
    );

    const newLookPointViewport = [
      startLookPointViewport[0] + cursorStartPosition[0] - moveEvent.clientX,
      startLookPointViewport[1] + cursorStartPosition[1] - moveEvent.clientY,
      0
    ];

    camera.lookPoint = isCentered(
      viewport,
      baseCenterViewport,
      newLookPointViewport
    )
      ? Coordinates.convert(baseCenterViewport, viewport, dataset)
      : Coordinates.convert(newLookPointViewport, viewport, dataset);

    camera.eyePoint = V(camera.lookPoint).sub(direction);
  };
}
