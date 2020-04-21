export function getLineIndent(code: string, cursorPosition: number): number {
  const line = code.slice(0, cursorPosition).match(/\n/g)?.length || 0;
  return code.split('\n')[line].match(/^ */)?.[0].length || 0;
}
