import { AUTO_CLOSE_GROUPS } from '../../../constants';

export function isAutoCloseChar(char: string): boolean {
  return AUTO_CLOSE_GROUPS.some((group) => group[1] === char);
}
