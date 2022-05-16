import { EditableState } from '../../../interfaces/EditableState';
import { Selection } from '../../../interfaces/Selection';
import { createSelection } from '../../../utils/createSelection';
import { spliceString } from '../../../utils/spliceString';
import { INDENT } from '../constants';
import { getLineOffset } from './getLineOffset';

export function unindent(
  code: string,
  selection: Selection
): EditableState | undefined {
  if (selection[1] !== selection[0]) {
    const firstLineOffset = getLineOffset(code, selection[0]);
    const processedLineOffsets = [] as number[];
    let lastLineOffset = getLineOffset(code, selection[1]);
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
        Math.max(selection[0] - INDENT.length, firstLineOffset),
        selection[1] - INDENT.length * processedLineOffsets.length
      ),
    };
  }
  if (code.slice(selection[0] - INDENT.length, selection[0]) === INDENT) {
    const newCursorOffset = selection[0] - INDENT.length;

    return {
      code: spliceString(code, newCursorOffset, INDENT.length),
      selection: createSelection(newCursorOffset),
    };
  }
}
