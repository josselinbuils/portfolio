import { Size } from '~/platform/interfaces';
import { RefObject } from 'react';

export function getRefElementSize(elementRef: RefObject<HTMLElement>): Size {
  if (elementRef.current === null) {
    throw new Error('Unable to retrieve desktop element');
  }
  const { clientHeight, clientWidth } = elementRef.current;
  return { width: clientWidth, height: clientHeight };
}
