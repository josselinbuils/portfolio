import { END_CODE_PORTION_CHARS } from '../constants';

export function isCodePortionEnd(code: string, cursorOffset: number): boolean {
  return END_CODE_PORTION_CHARS.includes(code[cursorOffset]);
}
