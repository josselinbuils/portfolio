import { EditableState } from '../../../interfaces/EditableState';
import { Selection } from '../../../interfaces/Selection';
import { createSelection } from '../../../utils/createSelection';
import { spliceString } from '../../../utils/spliceString';
import { getCorrectedSelectionEnd } from './getCorrectedSelectionEnd';
import { getLine } from './getLine';
import { getLineEndOffset } from './getLineEndOffset';
import { getLineOffset } from './getLineOffset';

export function moveLines(
  code: string,
  selection: Selection,
  direction: -1 | 1
): EditableState | undefined {
  const correctedSelectionEnd = getCorrectedSelectionEnd(code, selection);
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
