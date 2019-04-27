import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { Size } from '~/platform/interfaces';

import { bound, getRefElementSize } from '../utils';
import { LEFT_OFFSET } from '~/platform/providers/WindowProvider/constants';

export function useSize(
  defaultSize: Size | undefined,
  maxSize: Size,
  minSize: Size,
  keepContentRatio: boolean,
  windowRef: RefObject<HTMLDivElement>,
  contentRef: RefObject<HTMLDivElement>,
  callback: (size: Size) => void
): [
  Size | undefined,
  (width: number, height: number, force?: boolean) => void,
  () => void
] {
  const [size, setSize] = useState<Size | undefined>();
  const contentRatioRef = useRef<number | undefined>();

  const updateSize = useCallback(
    (width: number, height: number, force: boolean = false) => {
      if (!force) {
        width = bound(width, minSize.width, maxSize.width);
        height = bound(height, minSize.height, maxSize.height);

        if (contentRatioRef.current !== undefined) {
          const windowSize = getRefElementSize(windowRef);
          const contentSize = getRefElementSize(contentRef);
          const dx = windowSize.width - contentSize.width;
          const dy = windowSize.height - contentSize.height;

          height = Math.round((width - dx) / contentRatioRef.current) + dy;
        }
      }

      setSize({ width, height });
      callback({ width, height });
    },
    [callback, contentRatioRef, contentRef, maxSize, minSize, windowRef]
  );

  const setMaxSize = useCallback(() => {
    updateSize(window.innerWidth - LEFT_OFFSET, window.innerHeight, true);
  }, [updateSize]);

  useEffect(() => {
    if (keepContentRatio) {
      const contentSize = getRefElementSize(contentRef);
      contentRatioRef.current = contentSize.width / contentSize.height;
    } else {
      contentRatioRef.current = undefined;
    }
  }, [contentRef, keepContentRatio]);

  return [size, updateSize, setMaxSize];
}
