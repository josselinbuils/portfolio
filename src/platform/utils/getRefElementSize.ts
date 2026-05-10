import { type RefObject } from 'preact';

import { type Size } from '../interfaces/Size';

export function getRefElementSize(elementRef: RefObject<HTMLElement>): Size {
  if (elementRef.current === null) {
    throw new Error('Unable to retrieve desktop element');
  }
  const { clientHeight, clientWidth } = elementRef.current;
  return { height: clientHeight, width: clientWidth };
}
