import { INDENT } from '../constants';
import { EditableState } from '../interfaces/EditableState';
import { Selection } from '../interfaces/Selection';
import { getLineOffset } from './getLineOffset';
import { spliceString } from './spliceString';

export function indent(code: string, selection: Selection): EditableState {
  const addCount = INDENT.length;

  if (selection.end === selection.start) {
    const newCursorOffset = selection.start + addCount;

    return {
      code: spliceString(code, selection.start, 0, INDENT),
      selection: {
        start: newCursorOffset,
        end: newCursorOffset,
      },
    };
  } else {
    const firstLineOffset = getLineOffset(code, selection.start);
    const processedLineOffsets = [] as number[];
    let lastLineOffset = getLineOffset(code, selection.end);
    let newCode = code;

    for (let i = firstLineOffset; i <= lastLineOffset; i++) {
      const lineOffset = getLineOffset(newCode, i);

      if (!processedLineOffsets.includes(lineOffset)) {
        newCode = spliceString(newCode, lineOffset, 0, INDENT);
        processedLineOffsets.push(lineOffset);
        lastLineOffset += addCount;
      }
    }

    return {
      code: newCode,
      selection: {
        start: selection.start + addCount,
        end: selection.end + addCount * processedLineOffsets.length,
      },
    };
  }
}
