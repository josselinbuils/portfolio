import { RefObject } from 'react';

import { getRefElementSize } from './getRefElementSize';

export function applyContentRatio(
  windowRef: RefObject<HTMLElement>,
  contentRef: RefObject<HTMLElement>,
  ratio: number,
  width: number
): number {
  const windowSize = getRefElementSize(windowRef);
  const contentSize = getRefElementSize(contentRef);
  const dx = windowSize.width - contentSize.width;
  const dy = windowSize.height - contentSize.height;
  return Math.round((width - dx) / ratio) + dy;
}
