import { getLineBeforeCursor } from './getLineBeforeCursor';

export function getLineIndentBeforeCursor(
  code: string,
  cursorOffset: number
): number {
  return getLineBeforeCursor(code, cursorOffset).match(/^ */)?.[0].length || 0;
}
