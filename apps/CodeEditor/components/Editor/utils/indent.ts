import { EditableState } from '../../../interfaces/EditableState';
import { Selection } from '../../../interfaces/Selection';
import { createSelection } from '../../../utils/createSelection';
import { spliceString } from '../../../utils/spliceString';
import { INDENT } from '../constants';
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
  const processedLineOffsets = [] as number[];
  let lastLineOffset = getLineOffset(code, selection[1]);
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
      selection[0] === firstLineOffset
        ? selection[0]
        : selection[0] + INDENT.length,
      selection[1] + INDENT.length * processedLineOffsets.length
    ),
  };
}
