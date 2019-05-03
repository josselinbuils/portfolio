import { useEffect, useRef, useState } from 'react';
import { Size } from '~/platform/interfaces';
import { TITLEBAR_HEIGHT } from '../constants';
import { bound, getDesktopSize } from '../utils';

export function useSize(
  sizeLimits: SizeLimits,
  keepContentRatio: boolean,
  callback: (size: Size) => void
): [
  Size,
  (width: number, height: number, force?: boolean) => Size,
  () => Size
] {
  const { maxHeight, maxWidth, minHeight, minWidth } = sizeLimits;
  const [size, setSize] = useState({ height: minHeight, width: minWidth });
  const contentRatioRef = useRef<number | undefined>();

  function updateSize(width: number, height: number, force = false) {
    if (!force) {
      width = bound(width, minWidth, maxWidth);
      height = bound(height, minHeight, maxHeight);

      if (contentRatioRef.current !== undefined) {
        height = Math.round(width / contentRatioRef.current) + TITLEBAR_HEIGHT;
      }
    }

    const newSize = Object.freeze({ width, height });

    setSize(newSize);
    callback(newSize);

    return newSize;
  }

  function setMaxSize() {
    const { width, height } = getDesktopSize();
    return updateSize(width, height, true);
  }

  useEffect(() => {
    if (keepContentRatio) {
      contentRatioRef.current = size.width / (size.height - TITLEBAR_HEIGHT);
    } else {
      contentRatioRef.current = undefined;
    }
  }, [keepContentRatio, size]);

  return [size, updateSize, setMaxSize];
}

interface SizeLimits {
  maxHeight: number;
  maxWidth: number;
  minHeight: number;
  minWidth: number;
}
