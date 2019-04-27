import { RefObject, useState } from 'react';
import { getRefElementSize } from '../utils';

export function usePosition(
  windowRef: RefObject<HTMLDivElement>
): [{ x: number; y: number }, (x: number, y: number, force?: boolean) => void] {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  const updatePosition = (x: number, y: number, force: boolean = false) => {
    if (!force) {
      // TODO move all that magic numbers
      const xMin = -getRefElementSize(windowRef).width + 90;
      const yMin = -1;
      const xMax = window.innerWidth - 30;
      const yMax = window.innerHeight - 21;

      x = Math.min(Math.max(x, xMin), xMax);
      y = Math.min(Math.max(y, yMin), yMax);

      setPosition({ x, y });
    }
    setPosition({ x, y });
  };

  return [position, updatePosition];
}
