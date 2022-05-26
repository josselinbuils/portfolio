import { getLine } from './getLine';
import { getLineOffset } from './getLineOffset';

export function getLineEndOffset(code: string, cursorOffset: number): number {
  return getLineOffset(code, cursorOffset) + getLine(code, cursorOffset).length;
}
