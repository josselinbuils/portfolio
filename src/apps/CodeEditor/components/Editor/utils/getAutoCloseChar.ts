import { AUTO_CLOSE_MAP } from '../constants';

export function getAutoCloseChar(openChar: string): string | undefined {
  return AUTO_CLOSE_MAP[openChar];
}
