export function getLineNumber(code: string, cursorOffset: number): number {
  return code.slice(0, cursorOffset).match(/\n/g)?.length || 0;
}
