import { Position, Size } from '~/platform/interfaces';
import { BUTTONS_MAX_WIDTH, MIN_USABLE_SIZE } from '../constants';
import { bound } from './bound';

export function boundPosition(
  x: number,
  y: number,
  visibleAreaSize: Size,
  windowWidth: number
): Position {
  const xMin = -windowWidth + MIN_USABLE_SIZE;
  const yMin = 0;
  const xMax = visibleAreaSize.width - BUTTONS_MAX_WIDTH - MIN_USABLE_SIZE;
  const yMax = visibleAreaSize.height - MIN_USABLE_SIZE;

  return {
    x: bound(x, xMin, xMax),
    y: bound(y, yMin, yMax)
  };
}
