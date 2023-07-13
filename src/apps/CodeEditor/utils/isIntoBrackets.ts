import { BRACKET_GROUPS } from '../constants';

export function isIntoBrackets(code: string, cursorOffset: number): boolean {
  return BRACKET_GROUPS.includes(
    code.slice(cursorOffset - 1, cursorOffset + 1),
  );
}
