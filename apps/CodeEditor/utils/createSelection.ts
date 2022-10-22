import type { Selection } from '../interfaces/Selection';

export function createSelection(
  start: number | readonly number[],
  end: number = start as number
): Selection {
  return Object.freeze(
    Array.isArray(start) ? start : [start, end]
  ) as Selection;
}
