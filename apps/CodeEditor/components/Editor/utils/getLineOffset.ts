import { getLineBeforeCursor } from './getLineBeforeCursor';

export function getLineOffset(code: string, cursorOffset: number): number {
  return cursorOffset - getLineBeforeCursor(code, cursorOffset).length;
}
