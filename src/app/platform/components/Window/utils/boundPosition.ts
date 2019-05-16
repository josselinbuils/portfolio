import { Position, Size } from '~/platform/interfaces';
import { BUTTONS_MAX_WIDTH, MIN_USABLE_SIZE } from '../constants';
import { bound } from '../utils';

export function boundPosition(
  x: number,
  y: number,
  desktopSize: Size,
  windowWidth: number
): Position {
  const xMin = -windowWidth + MIN_USABLE_SIZE;
  const yMin = 0;
  const xMax = desktopSize.width - BUTTONS_MAX_WIDTH - MIN_USABLE_SIZE;
  const yMax = desktopSize.height - MIN_USABLE_SIZE;

  return {
    x: bound(x, xMin, xMax),
    y: bound(y, yMin, yMax)
  };
}
