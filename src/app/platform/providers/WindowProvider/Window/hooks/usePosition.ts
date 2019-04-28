import { useState } from 'react';
import { Size } from '~/platform/interfaces';
import {
  BUTTONS_MAX_WIDTH,
  TASKBAR_WIDTH,
  TITLEBAR_HEIGHT
} from '../../constants';
import { bound } from '../utils';

const MIN_USABLE_WIDTH = 10;

export function usePosition(
  initialSize: Size
): [
  { x: number; y: number },
  (x: number, y: number, windowWidth: number, force?: boolean) => void
] {
  const [position, setPosition] = useState({
    x: Math.round((window.innerWidth - initialSize.width) * 0.5),
    y: Math.round((window.innerHeight - initialSize.height) * 0.2)
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
      const xMax = window.innerWidth - BUTTONS_MAX_WIDTH - MIN_USABLE_WIDTH;
      const yMax = window.innerHeight - TITLEBAR_HEIGHT;

      x = bound(x, xMin, xMax);
      y = bound(y, yMin, yMax);
    }
    setPosition(Object.freeze({ x, y }));
  }

  return [position, updatePosition];
}
