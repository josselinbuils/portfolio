import type { EditableState } from '../../../interfaces/EditableState';
import type { Selection } from '../../../interfaces/Selection';
import { createSelection } from '../../../utils/createSelection';
import { spliceString } from '../../../utils/spliceString';
import { getLine } from './getLine';
import { getLineOffset } from './getLineOffset';

export function duplicate(
  code: string,
  selection: Selection,
): EditableState | undefined {
  if (selection[1] === selection[0]) {
    const line = getLine(code, selection[0]);
    const lineOffset = getLineOffset(code, selection[0]);

    return line.trim().length > 0
      ? {
          code: spliceString(code, lineOffset + line.length, 0, `\n${line}`),
          selection: createSelection(selection[0] + line.length + 1),
        }
      : undefined;
  }

  const selectedText = code.slice(selection[0], selection[1]);

  return {
    code: spliceString(code, selection[1], 0, selectedText),
    selection: createSelection(
      selection[0] + selectedText.length,
      selection[1] + selectedText.length,
    ),
  };
}
