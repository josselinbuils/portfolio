import { getLine } from './getLine';

export function getLineIndent(code: string, cursorOffset: number): number {
  return getLine(code, cursorOffset).match(/^ */)?.[0].length || 0;
}
