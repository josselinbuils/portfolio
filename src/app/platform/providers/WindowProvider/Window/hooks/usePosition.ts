import { useState } from 'react';
import { Size } from '~/platform/interfaces';
import {
  BUTTONS_MAX_WIDTH,
  TASKBAR_WIDTH,
  TITLEBAR_HEIGHT
} from '../../constants';
import { bound, getDesktopSize } from '../utils';

const MIN_USABLE_WIDTH = 10;

export function usePosition(
  initialSize: Size
): [
  { x: number; y: number },
  (x: number, y: number, windowWidth: number, force?: boolean) => void
] {
  const desktopSize = getDesktopSize();
  const [position, setPosition] = useState({
    x: Math.round((desktopSize.width - initialSize.width) * 0.5),
    y: Math.round((desktopSize.height - initialSize.height) * 0.2)
  });

  function updatePosition(
    x: number,
    y: number,
    windowWidth: number,
    force = false
  ) {
    if (!force) {
      const xMin = -windowWidth + TASKBAR_WIDTH + MIN_USABLE_WIDTH;
      const yMin = 0;
      const xMax =
        desktopSize.width +
        TASKBAR_WIDTH -
        BUTTONS_MAX_WIDTH -
        MIN_USABLE_WIDTH;
      const yMax = desktopSize.height - TITLEBAR_HEIGHT;

      x = bound(x, xMin, xMax);
      y = bound(y, yMin, yMax);
    }
    setPosition(Object.freeze({ x, y }));
  }

  return [position, updatePosition];
}
