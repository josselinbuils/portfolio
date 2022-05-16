import { Selection } from '../interfaces/Selection';

export function createSelection(start: number, end: number = start): Selection {
  return Object.freeze([start, end]) as Selection;
}
