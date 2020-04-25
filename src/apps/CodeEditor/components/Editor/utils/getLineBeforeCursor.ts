export function getLineBeforeCursor(
  code: string,
  cursorOffset: number
): string {
  return code.slice(0, cursorOffset).split('\n').pop() as string;
}
