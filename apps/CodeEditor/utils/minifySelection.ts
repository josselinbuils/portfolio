import type { Selection } from '../interfaces/Selection';

export function minifySelection(selection: Selection): number | Selection {
  const [start, end] = selection;
  return end === start ? start : selection;
}
