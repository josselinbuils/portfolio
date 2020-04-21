import { BRACKET_GROUPS } from '../constants';

export function isIntoBrackets(code: string, cursorPosition: number): boolean {
  return BRACKET_GROUPS.includes(
    code.slice(cursorPosition - 1, cursorPosition + 1)
  );
}
