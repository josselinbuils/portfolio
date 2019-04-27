import { MutableRefObject, RefObject } from 'react';

import { getRefElementSize } from './getRefElementSize';

export function applyContentRatio(
  windowRef: RefObject<HTMLElement>,
  contentRef: RefObject<HTMLElement>,
  contentRatioRef: MutableRefObject<number | undefined>,
  width: number,
  height: number
): number {
  if (contentRatioRef.current === undefined) {
    return height;
  }

  const windowSize = getRefElementSize(windowRef);
  const contentSize = getRefElementSize(contentRef);
  const dx = windowSize.width - contentSize.width;
  const dy = windowSize.height - contentSize.height;

  return Math.round((width - dx) / contentRatioRef.current) + dy;
}
