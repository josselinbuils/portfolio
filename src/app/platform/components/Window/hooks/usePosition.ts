import { RefObject, useCallback, useState } from 'react';
import { Size } from '~/platform/interfaces';
import { BUTTONS_MAX_WIDTH, MIN_USABLE_SIZE } from '../constants';
import { bound, getSize } from '../utils';

export function usePosition(
  initialSize: Size,
  desktopRef: RefObject<HTMLElement>
): [
  { x: number; y: number },
  (x: number, y: number, windowWidth?: number) => void
] {
  const [position, setPosition] = useState(() => {
    const desktopSize = getSize(desktopRef);
    return {
      x: Math.round((desktopSize.width - initialSize.width) * 0.5),
      y: Math.round((desktopSize.height - initialSize.height) * 0.2)
    };
  });

  const updatePosition = useCallback(
    (x: number, y: number, windowWidth?: number) => {
      if (windowWidth !== undefined) {
        const desktopSize = getSize(desktopRef);
        const xMin = -windowWidth + MIN_USABLE_SIZE;
        const yMin = 0;
        const xMax = desktopSize.width - BUTTONS_MAX_WIDTH - MIN_USABLE_SIZE;
        const yMax = desktopSize.height - MIN_USABLE_SIZE;

        x = bound(x, xMin, xMax);
        y = bound(y, yMin, yMax);
      }
      setPosition(Object.freeze({ x, y }));
    },
    [desktopRef]
  );

  return [position, updatePosition];
}
