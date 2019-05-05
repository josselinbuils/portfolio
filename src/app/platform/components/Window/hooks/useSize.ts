import { RefObject, useRef, useState } from 'react';
import { Size } from '~/platform/interfaces';
import { bound, getSize } from '../utils';
import { useChangeDetector } from '~/platform/hooks';

export function useSize(
  sizeLimits: SizeLimits,
  keepContentRatio: boolean,
  desktopRef: RefObject<HTMLElement>,
  contentRef: RefObject<HTMLElement>,
  callback: (size: Size) => void
): [
  Size,
  (width: number, height: number, force?: boolean) => Size,
  () => Size
] {
  const { maxHeight, maxWidth, minHeight, minWidth } = sizeLimits;
  const [deltaY, setDeltaY] = useState(0);
  const [size, setSize] = useState({ height: minHeight, width: minWidth });
  const contentRatioRef = useRef<number>();

  function updateSize(width: number, height: number, force = false) {
    if (!force) {
      width = bound(width, minWidth, maxWidth);
      height = bound(height, minHeight, maxHeight);

      if (contentRatioRef.current !== undefined) {
        height = Math.round(width / contentRatioRef.current) + deltaY;
      }
    }

    const newSize = Object.freeze({ width, height });

    setSize(newSize);
    callback(newSize);

    return newSize;
  }

  function setMaxSize() {
    const { width, height } = getSize(desktopRef);
    return updateSize(width, height, true);
  }

  useChangeDetector(keepContentRatio, () => {
    if (keepContentRatio) {
      const contentSize = getSize(contentRef);
      contentRatioRef.current = contentSize.width / contentSize.height;
      setDeltaY(size.height - contentSize.height);
    } else {
      contentRatioRef.current = undefined;
    }
  });

  return [size, updateSize, setMaxSize];
}

interface SizeLimits {
  maxHeight: number;
  maxWidth: number;
  minHeight: number;
  minWidth: number;
}
