import { EditableState } from '../../../interfaces/EditableState';
import { Selection } from '../../../interfaces/Selection';
import { createSelection } from '../../../utils/createSelection';
import { spliceString } from '../../../utils/spliceString';
import { INDENT } from '../constants';
import { getLineOffset } from './getLineOffset';

export function indent(code: string, selection: Selection): EditableState {
  if (selection.end === selection.start) {
    const newCursorOffset = selection.start + INDENT.length;

    return {
      code: spliceString(code, selection.start, 0, INDENT),
      selection: createSelection(newCursorOffset),
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
        lastLineOffset += INDENT.length;
      }
    }

    return {
      code: newCode,
      selection: createSelection(
        selection.start + INDENT.length,
        selection.end + INDENT.length * processedLineOffsets.length
      ),
    };
  }
}
