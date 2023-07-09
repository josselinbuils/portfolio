import { type EditableState } from '../../../interfaces/EditableState';
import { type Selection } from '../../../interfaces/Selection';
import { createSelection } from '../../../utils/createSelection';
import { spliceString } from '../../../utils/spliceString';
import { INDENT } from '../constants';
import { getCorrectedSelectionEnd } from './getCorrectedSelectionEnd';
import { getLine } from './getLine';
import { getLineOffset } from './getLineOffset';

export function indent(code: string, selection: Selection): EditableState {
  if (selection[1] === selection[0]) {
    const newCursorOffset = selection[0] + INDENT.length;

    return {
      code: spliceString(code, selection[0], 0, INDENT),
      selection: createSelection(newCursorOffset),
    };
  }
  const firstLineOffset = getLineOffset(code, selection[0]);
  const correctedSelectionEnd = getCorrectedSelectionEnd(code, selection);
  let lastLineOffset = getLineOffset(code, correctedSelectionEnd);
  let newCode = code;
  let lineOffset = firstLineOffset;
  let indentCount = 0;

  while (lineOffset <= lastLineOffset) {
    const line = getLine(newCode, lineOffset);

    newCode = spliceString(newCode, lineOffset, 0, INDENT);
    lastLineOffset += INDENT.length;
    lineOffset += line.length + INDENT.length + 1;
    indentCount += 1;
  }

  return {
    code: newCode,
    selection: createSelection(
      selection[0] === firstLineOffset
        ? selection[0]
        : selection[0] + INDENT.length,
      selection[1] + INDENT.length * indentCount,
    ),
  };
}
