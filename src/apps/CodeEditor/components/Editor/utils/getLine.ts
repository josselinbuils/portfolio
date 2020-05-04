import { getLineNumber } from './getLineNumber';

export function getLine(code: string, cursorOffset: number): string {
  const lineNumber = getLineNumber(code, cursorOffset);
  return code.split('\n')[lineNumber];
}
