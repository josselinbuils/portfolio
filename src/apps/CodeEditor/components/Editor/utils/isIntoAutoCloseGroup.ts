import { AUTO_CLOSE_GROUPS } from '../constants';

export function isIntoAutoCloseGroup(
  code: string,
  cursorPosition: number
): boolean {
  return AUTO_CLOSE_GROUPS.includes(
    code.slice(cursorPosition - 1, cursorPosition + 1)
  );
}
