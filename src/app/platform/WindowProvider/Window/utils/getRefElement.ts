import { RefObject } from 'react';

export function getRefElement(ref: RefObject<HTMLElement>): HTMLElement {
  const element = ref.current;

  if (element === null) {
    throw new Error('Unable to retrieve element from reference');
  }
  return element;
}
