import { INDENT } from '../constants';
import { EditableState } from '../interfaces/EditableState';
import { Selection } from '../interfaces/Selection';
import { createSelection } from './createSelection';
import { getLineOffset } from './getLineOffset';
import { spliceString } from './spliceString';

export function unindent(
  code: string,
  selection: Selection
): EditableState | undefined {
  if (selection.end !== selection.start) {
    const firstLineOffset = getLineOffset(code, selection.start);
    const processedLineOffsets = [] as number[];
    let lastLineOffset = getLineOffset(code, selection.end);
    let newCode = code;

    for (let i = firstLineOffset; i <= lastLineOffset; i++) {
      const lineOffset = getLineOffset(newCode, i);

      if (!processedLineOffsets.includes(lineOffset)) {
        if (newCode.slice(lineOffset, lineOffset + INDENT.length) !== INDENT) {
          return;
        }
        newCode = spliceString(newCode, lineOffset, INDENT.length);
        processedLineOffsets.push(lineOffset);
        lastLineOffset -= INDENT.length;
      }
    }
    return {
      code: newCode,
      selection: createSelection(
        Math.max(selection.start - INDENT.length, firstLineOffset),
        selection.end - INDENT.length * processedLineOffsets.length
      ),
    };
  } else if (
    code.slice(selection.start - INDENT.length, selection.start) === INDENT
  ) {
    const newCursorOffset = selection.start - INDENT.length;

    return {
      code: spliceString(code, newCursorOffset, INDENT.length),
      selection: createSelection(newCursorOffset),
    };
  }
}
