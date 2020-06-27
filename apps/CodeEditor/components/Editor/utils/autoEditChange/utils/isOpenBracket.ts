import { BRACKET_GROUPS } from '~/apps/CodeEditor/constants';

export function isOpenBracket(char: string): boolean {
  return BRACKET_GROUPS.some((group) => group[0] === char);
}
