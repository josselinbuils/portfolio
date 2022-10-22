import type { Selection } from '../../../interfaces/Selection';
import { getLineBeforeCursor } from './getLineBeforeCursor';

/**
 * Prevents unexpected move of next line when the selection of the last line
 * selected is extended ,ie when a not existing last character is selected.
 */
export function getCorrectedSelectionEnd(
  code: string,
  selection: Selection
): number {
  return selection[1] !== selection[0] &&
    getLineBeforeCursor(code, selection[1]) === ''
    ? selection[1] - 1
    : selection[1];
}
