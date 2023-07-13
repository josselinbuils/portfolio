import { CURSOR } from '../dictionary';

export function getCompletion(
  template: string,
  cursorOffset: number,
  partialKeyword: string,
  lineIndent: number,
): { completion: string; newCursorOffset: number } {
  const cursorOffsetInTemplate = template.indexOf(CURSOR);

  const newCursorOffset =
    cursorOffset -
    partialKeyword.length +
    (cursorOffsetInTemplate !== -1 ? cursorOffsetInTemplate : template.length);

  const completion = template
    .slice(partialKeyword.length)
    .replace(CURSOR, '')
    .replace(/\n/g, `\n${' '.repeat(lineIndent)}`);

  return { completion, newCursorOffset };
}
