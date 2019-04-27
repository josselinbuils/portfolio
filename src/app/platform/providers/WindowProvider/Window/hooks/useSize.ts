import { RefObject, useCallback, useEffect, useRef, useState } from 'react';
import { Size } from '~/platform/interfaces';

import { applyContentRatio, bound, getRefElementSize } from '../utils';
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
        height = applyContentRatio(
          windowRef,
          contentRef,
          contentRatioRef,
          width,
          height
        );
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
