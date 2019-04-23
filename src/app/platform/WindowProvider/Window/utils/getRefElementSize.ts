import { RefObject } from 'react';
import { getRefElement } from '~/platform/WindowProvider/Window/utils/getRefElement';

export function getRefElementSize(
  ref: RefObject<HTMLElement>
): { width: number; height: number } {
  const { clientHeight, clientWidth } = getRefElement(ref);
  return { height: clientHeight, width: clientWidth };
}
