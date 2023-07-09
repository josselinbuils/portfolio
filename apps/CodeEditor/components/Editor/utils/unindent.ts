import type { EditableState } from '../../../interfaces/EditableState';
import type { Selection } from '../../../interfaces/Selection';
import { createSelection } from '../../../utils/createSelection';
import { spliceString } from '../../../utils/spliceString';
import { INDENT } from '../constants';
import { getCorrectedSelectionEnd } from './getCorrectedSelectionEnd';
import { getLine } from './getLine';
import { getLineOffset } from './getLineOffset';

export function unindent(
  code: string,
  selection: Selection,
): EditableState | undefined {
  if (selection[1] !== selection[0]) {
    const firstLineOffset = getLineOffset(code, selection[0]);
    const correctedSelectionEnd = getCorrectedSelectionEnd(code, selection);
    let lastLineOffset = getLineOffset(code, correctedSelectionEnd);
    let newCode = code;
    let lineOffset = firstLineOffset;
    let unindentCount = 0;

    while (lineOffset <= lastLineOffset) {
      const line = getLine(newCode, lineOffset);

      if (newCode.slice(lineOffset, lineOffset + INDENT.length) === INDENT) {
        newCode = spliceString(newCode, lineOffset, INDENT.length);
        unindentCount += 1;
        lastLineOffset -= INDENT.length;
        lineOffset += line.length - INDENT.length + 1;
      } else {
        lineOffset += line.length + 1;
      }
    }

    return {
      code: newCode,
      selection: createSelection(
        Math.max(selection[0] - INDENT.length, firstLineOffset),
        selection[1] - INDENT.length * unindentCount,
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
