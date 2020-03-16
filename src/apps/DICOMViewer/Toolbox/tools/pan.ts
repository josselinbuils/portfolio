import { V } from '../../math';
import { Viewport, Volume } from '../../models';
import { Coordinates } from '../../utils';
import { ToolMoveListener } from '../Toolbox';

const DELTA_LIMIT = 0.02;

export function startPan(
  viewport: Viewport,
  downEvent: MouseEvent
): ToolMoveListener {
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

export function isCentered(
  viewport: Viewport,
  baseCenterViewport?: number[],
  lookPointViewport?: number[]
): boolean {
  const { camera, dataset } = viewport;

  if (baseCenterViewport === undefined) {
    const baseCenter = dataset.is3D
      ? (dataset.volume as Volume).center
      : dataset.frames[0].imageCenter;
    baseCenterViewport = Coordinates.convert(baseCenter, dataset, viewport);
  }

  if (lookPointViewport === undefined) {
    lookPointViewport = Coordinates.convert(
      camera.lookPoint,
      dataset,
      viewport
    );
  }

  const deltaX =
    (baseCenterViewport[0] - lookPointViewport[0]) / viewport.width;
  const deltaY =
    (baseCenterViewport[1] - lookPointViewport[1]) / viewport.height;

  return Math.abs(deltaX) < DELTA_LIMIT && Math.abs(deltaY) < DELTA_LIMIT;
}
