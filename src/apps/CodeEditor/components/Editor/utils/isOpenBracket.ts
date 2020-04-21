import { BRACKET_GROUPS } from '../constants';

export function isOpenBracket(char: string): boolean {
  return BRACKET_GROUPS.some((group) => group[0] === char);
}
