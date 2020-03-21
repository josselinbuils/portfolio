import { Viewport, Volume } from '../../../models';
import { Coordinates } from '../../../utils';

const DELTA_LIMIT = 0.02;

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
