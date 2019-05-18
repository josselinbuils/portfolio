import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { Size } from '~/platform/interfaces';
import { bound, getSize } from '../utils';

export function useSize(
  sizeLimits: SizeLimits,
  keepContentRatio: boolean,
  desktopRef: RefObject<HTMLElement>,
  windowRef: RefObject<HTMLElement>,
  contentRef: RefObject<HTMLElement>,
  callback: (size: Size) => void
): [Size, (width: number, height: number, force?: boolean) => Size] {
  const { maxHeight, maxWidth, minHeight, minWidth } = sizeLimits;
  const [deltaY, setDeltaY] = useState(0);
  const [size, setSize] = useState({ height: minHeight, width: minWidth });
  const callbackRef = useRef(callback);
  const contentRatioRef = useRef<number>();

  const updateSize = useCallback(
    (width: number, height: number, force = false) => {
      if (!force) {
        width = bound(width, minWidth, maxWidth);
        height = bound(height, minHeight, maxHeight);

        if (contentRatioRef.current !== undefined) {
          height = Math.round(width / contentRatioRef.current) + deltaY;
        }
      }

      const newSize = { width, height };

      setSize(newSize);
      callbackRef.current(newSize);

      return newSize;
    },
    [deltaY, maxHeight, maxWidth, minHeight, minWidth]
  );

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    if (keepContentRatio) {
      const { height, width } = getSize(contentRef);
      contentRatioRef.current = width / height;
    } else {
      contentRatioRef.current = undefined;
    }
  }, [contentRef, keepContentRatio]);

  useEffect(() => {
    setDeltaY(getSize(windowRef).height - getSize(contentRef).height);
  }, [contentRef, windowRef]);

  return [size, updateSize];
}

interface SizeLimits {
  maxHeight: number;
  maxWidth: number;
  minHeight: number;
  minWidth: number;
}
