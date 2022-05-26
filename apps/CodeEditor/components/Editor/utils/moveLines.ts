import { EditableState } from '../../../interfaces/EditableState';
import { Selection } from '../../../interfaces/Selection';
import { createSelection } from '../../../utils/createSelection';
import { spliceString } from '../../../utils/spliceString';
import { getLine } from './getLine';
import { getLineBeforeCursor } from './getLineBeforeCursor';
import { getLineEndOffset } from './getLineEndOffset';
import { getLineOffset } from './getLineOffset';

export function moveLines(
  code: string,
  selection: Selection,
  direction: -1 | 1
): EditableState | undefined {
  // Prevents unexpected move of next line when the selection of the last line
  // selected is extended ,ie when a not existing last character is selected.
  const correctedSelectionEnd =
    selection[1] !== selection[0] &&
    getLineBeforeCursor(code, selection[1]) === ''
      ? selection[1] - 1
      : selection[1];

  const firstLineOffset = getLineOffset(code, selection[0]);
  const lastLineEndOffset = getLineEndOffset(code, correctedSelectionEnd);
  const linesToMove = code.slice(firstLineOffset, lastLineEndOffset);

  if (direction === 1) {
    const lineAfterOffset = lastLineEndOffset + 1;
    const lineAfter = getLine(code, lineAfterOffset);

    return lineAfterOffset <= code.length
      ? {
          code: spliceString(
            code,
            firstLineOffset,
            linesToMove.length + lineAfter.length + 1,
            `${lineAfter}\n${linesToMove}`
          ),
          selection: createSelection(
            selection[0] + lineAfter.length + 1,
            selection[1] + lineAfter.length + 1
          ),
        }
      : undefined;
  }

  const lineBeforeOffset = getLineOffset(code, firstLineOffset - 1);
  const lineBefore = getLine(code, lineBeforeOffset);

  return lineBeforeOffset >= 0
    ? {
        code: spliceString(
          code,
          lineBeforeOffset,
          lineBefore.length + linesToMove.length + 1,
          `${linesToMove}\n${lineBefore}`
        ),
        selection: createSelection(
          selection[0] - lineBefore.length - 1,
          selection[1] - lineBefore.length - 1
        ),
      }
    : undefined;
}
