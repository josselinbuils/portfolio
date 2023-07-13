import { AUTO_CLOSE_GROUPS } from '../constants';

export function isIntoAutoCloseGroup(
  code: string,
  cursorOffset: number,
): boolean {
  return AUTO_CLOSE_GROUPS.includes(
    code.slice(cursorOffset - 1, cursorOffset + 1),
  );
}
