import { END_CODE_PORTION_CHARS, START_CODE_PORTION_CHARS } from '../constants';

export function isCodePortion(code: string, cursorOffset: number): boolean {
  return (
    START_CODE_PORTION_CHARS.includes(code[cursorOffset - 1]) &&
    END_CODE_PORTION_CHARS.includes(code[cursorOffset])
  );
}
