import { EditableState } from '../../../interfaces/EditableState';
import { Selection } from '../../../interfaces/Selection';
import { createSelection } from '../../../utils/createSelection';
import { spliceString } from '../../../utils/spliceString';
import { getLine } from './getLine';
import { getLineOffset } from './getLineOffset';

export function moveLine(
  code: string,
  selection: Selection,
  direction: -1 | 1
): EditableState | undefined {
  const lineOffset = getLineOffset(code, selection[0]);
  const line = getLine(code, selection[0]);

  if (direction === 1) {
    const lineAfterOffset = lineOffset + line.length + 1;
    const lineAfter = getLine(code, lineAfterOffset);

    return lineAfterOffset <= code.length
      ? {
          code: spliceString(
            code,
            lineOffset,
            line.length + lineAfter.length + 1,
            `${lineAfter}\n${line}`
          ),
          selection: createSelection(
            selection[0] + lineAfter.length + 1,
            selection[1] + lineAfter.length + 1
          ),
        }
      : undefined;
  }

  const lineBeforeOffset = getLineOffset(code, lineOffset - 1);
  const lineBefore = getLine(code, lineBeforeOffset);

  return lineBeforeOffset >= 0
    ? {
        code: spliceString(
          code,
          lineBeforeOffset,
          lineBefore.length + line.length + 1,
          `${line}\n${lineBefore}`
        ),
        selection: createSelection(
          selection[0] - lineBefore.length - 1,
          selection[1] - lineBefore.length - 1
        ),
      }
    : undefined;
}
