import { RefObject } from 'react';

import { getRefElementSize } from './getRefElementSize';

// This cannot be done when showing again a minimized window because its
// dimensions are null
export function boundWindowPosition(
  windowRef: RefObject<HTMLElement>,
  x: number,
  y: number
): { x: number; y: number } {
  // TODO move all that magic numbers
  const xMin = -getRefElementSize(windowRef).width + 90;
  const yMin = -1;
  const xMax = window.innerWidth - 30;
  const yMax = window.innerHeight - 21;

  x = Math.min(Math.max(x, xMin), xMax);
  y = Math.min(Math.max(y, yMin), yMax);

  return { x, y };
}
