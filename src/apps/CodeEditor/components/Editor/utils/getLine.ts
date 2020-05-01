export function getLine(code: string, cursorOffset: number): string {
  const lineNumber = code.slice(0, cursorOffset).match(/\n/g)?.length || 0;
  return code.split('\n')[lineNumber];
}
