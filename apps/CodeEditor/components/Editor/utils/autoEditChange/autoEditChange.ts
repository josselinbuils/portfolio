import { INDENT } from '../../constants';
import { EditableState } from '../../interfaces/EditableState';
import {
  applyDiff,
  Diff,
  DiffType,
  getCursorOffsetBeforeDiff,
  getDiffs,
} from '../diffs';
import { getLine } from '../getLine';
import { getLineBeforeCursor } from '../getLineBeforeCursor';
import { getLineIndent } from '../getLineIndent';
import { getLineNumber } from '../getLineNumber';
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
  const [type, start, diff] = diffs.pop() as Diff;

  if (diffs.length > 0) {
    const intermediateDiff = diffs.pop() as Diff;
    const cursorOffset = getCursorOffsetBeforeDiff(
      [type, start, diff],
      newState.selection.start
    );
    currentState = {
      code: applyDiff(currentState.code, intermediateDiff),
      selection: {
        end: cursorOffset,
        start: cursorOffset,
      },
    };
  }

  const autoCloseChar = getAutoCloseChar(diff);
  const allowAutoComplete = isCodePortionEnd(
    currentState.code,
    currentState.selection.start
  );
  let result: EditableState | undefined = newState;

  if (type === DiffType.Addition) {
    if (autoCloseChar !== undefined && allowAutoComplete) {
      const cursorOffset = newState.selection.start;

      result = {
        code: spliceString(newState.code, cursorOffset, 0, autoCloseChar),
        selection: {
          end: cursorOffset,
          start: cursorOffset,
        },
      };
    } else if (
      isIntoAutoCloseGroup(currentState.code, currentState.selection.start) &&
      isAutoCloseChar(diff)
    ) {
      result = undefined;
    } else if (diff === '\n') {
      const { code, selection } = currentState;

      if (isIntoBrackets(code, selection.start)) {
        const indent = getLineIndent(code, selection.start);
        const indentSpaces = ' '.repeat(indent);
        const insertion = `\n${indentSpaces}${INDENT}\n${indentSpaces}`;
        const cursorOffset = selection.start + indent + INDENT.length + 1;

        result = {
          code: spliceString(code, selection.start, 0, insertion),
          selection: {
            end: cursorOffset,
            start: cursorOffset,
          },
        };
      } else {
        let indent = getLineIndent(code, selection.start);
        const lineBeforeCursor = getLineBeforeCursor(code, selection.start);

        if (
          isOpenBracket(lineBeforeCursor.trim().slice(-1)) ||
          code[selection.start - 1] === ':'
        ) {
          indent += INDENT.length;
        } else {
          const line = getLine(code, selection.start);

          if (REGEX_BREAK.test(line) || REGEX_CHAINED_CALL.test(line)) {
            indent = Math.max(indent - INDENT.length, 0);
          }
        }

        const indentSpaces = ' '.repeat(indent);
        const insertion = `\n${indentSpaces}`;
        const cursorOffset = selection.start + insertion.length;

        result = {
          code: spliceString(code, selection.start, 0, insertion),
          selection: {
            end: cursorOffset,
            start: cursorOffset,
          },
        };
      }
    }
  } else if (diff.length === 1) {
    const { code, selection } = currentState;

    if (isIntoAutoCloseGroup(code, selection.start)) {
      result = {
        code: spliceString(code, selection.start - 1, 2),
        selection: newState.selection,
      };
    } else {
      const lineBeforeCursor = getLineBeforeCursor(code, selection.start);

      if (REGEX_SPACES_ONLY.test(lineBeforeCursor)) {
        if (getLineNumber(code, selection.start) > 0) {
          const delCount = lineBeforeCursor.length + 1;
          const cursorOffset = selection.start - delCount;

          result = {
            code: spliceString(code, selection.start - delCount, delCount),
            selection: {
              end: cursorOffset,
              start: cursorOffset,
            },
          };
        } else if (
          code.slice(selection.start - INDENT.length, selection.start) ===
          INDENT
        ) {
          // TODO make this common with shift + tab
          const delCount = INDENT.length;
          const cursorOffset = selection.start - delCount;

          result = {
            code: spliceString(code, selection.start - delCount, delCount),
            selection: {
              end: cursorOffset,
              start: cursorOffset,
            },
          };
        }
      }
    }
  }
  return result;
}
