import type { Viewport } from '../../../models/Viewport';
import type { Volume } from '../../../models/Volume';
import { changePointSpace } from '../../changePointSpace';

const DELTA_LIMIT = 0.02;

export function isImageCentered(
  viewport: Viewport,
  viewportCenter?: number[],
  lookPoint?: number[]
): boolean {
  const { camera, dataset } = viewport;

  if (viewportCenter === undefined) {
    const baseCenter = dataset.is3D
      ? (dataset.volume as Volume).center
      : dataset.frames[0].imageCenter;
    viewportCenter = changePointSpace(baseCenter, dataset, viewport);
  }

  if (lookPoint === undefined) {
    lookPoint = changePointSpace(camera.lookPoint, dataset, viewport);
  }

  const deltaX = (viewportCenter[0] - lookPoint[0]) / viewport.width;
  const deltaY = (viewportCenter[1] - lookPoint[1]) / viewport.height;

  return Math.abs(deltaX) < DELTA_LIMIT && Math.abs(deltaY) < DELTA_LIMIT;
}
