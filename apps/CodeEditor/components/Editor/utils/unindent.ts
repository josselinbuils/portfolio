import { INDENT } from '../constants';
import { EditableState } from '../interfaces/EditableState';
import { Selection } from '../interfaces/Selection';
import { getLineOffset } from './getLineOffset';
import { spliceString } from './spliceString';

export function unindent(
  code: string,
  selection: Selection
): EditableState | undefined {
  const deleteCount = INDENT.length;

  if (selection.end !== selection.start) {
    const firstLineOffset = getLineOffset(code, selection.start);
    const processedLineOffsets = [] as number[];
    let lastLineOffset = getLineOffset(code, selection.end);
    let newCode = code;

    for (let i = firstLineOffset; i <= lastLineOffset; i++) {
      const lineOffset = getLineOffset(newCode, i);

      if (!processedLineOffsets.includes(lineOffset)) {
        if (newCode.slice(lineOffset, lineOffset + deleteCount) !== INDENT) {
          return;
        }
        newCode = spliceString(newCode, lineOffset, deleteCount);
        processedLineOffsets.push(lineOffset);
        lastLineOffset -= deleteCount;
      }
    }
    return {
      code: newCode,
      selection: {
        start: Math.max(selection.start - deleteCount, firstLineOffset),
        end: selection.end - deleteCount * processedLineOffsets.length,
      },
    };
  } else if (
    code.slice(selection.start - deleteCount, selection.start) === INDENT
  ) {
    const newCursorOffset = selection.start - deleteCount;

    return {
      code: spliceString(code, selection.start - deleteCount, deleteCount),
      selection: {
        start: newCursorOffset,
        end: newCursorOffset,
      },
    };
  }
}
