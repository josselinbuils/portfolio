import { MouseEvent } from 'react';
import { findClosestElement } from '~/platform/utils';

export function hasButtonTarget(event: MouseEvent) {
  const target = event.target as HTMLElement;
  return findClosestElement(target, 'button') !== undefined;
}
