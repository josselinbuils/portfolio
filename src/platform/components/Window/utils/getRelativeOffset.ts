import { BUTTONS_MAX_WIDTH } from '../constants';

/**
 * Provides the x offset to keep the same position on the title bar in
 * proportion to its width when un-maximising a window by moving it.
 */
export function getRelativeOffset(
  downNativeEvent: MouseEvent,
  maximizedWidth: number,
  nextWidth: number
): number {
  const offsetX = downNativeEvent.offsetX;
  const widthRatio = nextWidth / maximizedWidth;

  return offsetX * widthRatio > BUTTONS_MAX_WIDTH
    ? offsetX * (1 - widthRatio)
    : offsetX - BUTTONS_MAX_WIDTH;
}
