import { INDENT } from '../../constants';
import { EditableState } from '../../interfaces/EditableState';
import { applyDiff, Diff, getCursorOffsetAfterDiff, getDiffs } from '../diffs';
import { getLine } from '../getLine';
import { getLineBeforeCursor } from '../getLineBeforeCursor';
import { getLineIndent } from '../getLineIndent';
import { isCodePortionEnd } from '../isCodePortionEnd';
import { isIntoAutoCloseGroup } from '../isIntoAutoCloseGroup';
import { spliceString } from '../spliceString';
import { getAutoCloseChar } from './utils/getAutoCloseChar';
import { isAutoCloseChar } from './utils/isAutoCloseChar';
import { isIntoBrackets } from './utils/isIntoBrackets';
import { isOpenBracket } from './utils/isOpenBracket';

const REGEX_BREAK = /^ *break; *$/;
const REGEX_CHAINED_CALL = /^ *\..+; *$/;
const REGEX_SPACES_ONLY = /^ *$/;

export function autoEditChange(
  currentState: EditableState,
  newState: EditableState
): EditableState | undefined {
  const diffs = getDiffs(currentState.code, newState.code);
  const [start, deleteCount, diff] = diffs.pop() as Diff;
  const isAddition = deleteCount === 0;

  if (diffs.length > 0) {
    const intermediateDiff = diffs.pop() as Diff;
    currentState = {
      code: applyDiff(currentState.code, intermediateDiff),
      cursorOffset: getCursorOffsetAfterDiff(intermediateDiff),
    };
  }

  const autoCloseChar = getAutoCloseChar(diff);
  const allowAutoComplete = isCodePortionEnd(
    currentState.code,
    currentState.cursorOffset
  );
  let result: EditableState | undefined = newState;

  if (isAddition) {
    if (autoCloseChar !== undefined && allowAutoComplete) {
      const cursorOffset = getCursorOffsetAfterDiff([start, deleteCount, diff]);

      result = {
        code: spliceString(newState.code, cursorOffset, 0, autoCloseChar),
        cursorOffset,
      };
    } else if (
      isIntoAutoCloseGroup(currentState.code, currentState.cursorOffset) &&
      isAutoCloseChar(diff)
    ) {
      result = undefined;
    } else if (diff === '\n') {
      const { code, cursorOffset } = currentState;

      if (isIntoBrackets(code, cursorOffset)) {
        const indent = getLineIndent(code, cursorOffset);
        const indentSpaces = ' '.repeat(indent);
        const insertion = `\n${indentSpaces}${INDENT}\n${indentSpaces}`;

        result = {
          code: spliceString(code, cursorOffset, 0, insertion),
          cursorOffset: cursorOffset + indent + INDENT.length + 1,
        };
      } else {
        let indent = getLineIndent(code, cursorOffset);
        const lineBeforeCursor = getLineBeforeCursor(code, cursorOffset);

        if (
          isOpenBracket(lineBeforeCursor.trim().slice(-1)) ||
          code[cursorOffset - 1] === ':'
        ) {
          indent += INDENT.length;
        } else {
          const line = getLine(code, cursorOffset);

          if (REGEX_BREAK.test(line) || REGEX_CHAINED_CALL.test(line)) {
            indent = Math.max(indent - INDENT.length, 0);
          }
        }

        const indentSpaces = ' '.repeat(indent);
        const insertion = `\n${indentSpaces}`;

        result = {
          code: spliceString(code, cursorOffset, 0, insertion),
          cursorOffset: cursorOffset + insertion.length,
        };
      }
    }
  } else if (diff.length === 1) {
    const { code, cursorOffset } = currentState;

    if (isIntoAutoCloseGroup(code, cursorOffset)) {
      result = {
        code: spliceString(code, cursorOffset - 1, 2),
        cursorOffset: newState.cursorOffset,
      };
    } else {
      const lineBeforeCursor = getLineBeforeCursor(code, cursorOffset);

      if (REGEX_SPACES_ONLY.test(lineBeforeCursor)) {
        const delCount = lineBeforeCursor.length + 1;

        result = {
          code: spliceString(code, cursorOffset - delCount, delCount),
          cursorOffset: cursorOffset - delCount,
        };
      }
    }
  }
  return result;
}
