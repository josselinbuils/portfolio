import { INDENT } from '../../constants';
import { State } from '../../interfaces';
import { getDiff } from '../getDiff';
import { getLine } from '../getLine';
import { getLineBeforeCursor } from '../getLineBeforeCursor';
import { getLineIndent } from '../getLineIndent';
import { isCodePortionEnd } from '../isCodePortionEnd';
import { isIntoAutoCloseGroup } from '../isIntoAutoCloseGroup';
import { spliceString } from '../spliceString';
import {
  getAutoCloseChar,
  isAutoCloseChar,
  isIntoBrackets,
  isOpenBracket,
} from './utils';

const REGEX_BREAK = /^ *break; *$/;
const REGEX_CHAINED_CALL = /^ *\..+; *$/;
const REGEX_SPACES_ONLY = /^ *$/;

export function autoEditChange(
  currentState: State,
  newState: State
): State | undefined {
  const { diff, endOffset, type } = getDiff(currentState.code, newState.code);
  const autoCloseChar = getAutoCloseChar(diff);
  const allowAutoComplete = isCodePortionEnd(
    currentState.code,
    currentState.cursorOffset
  );
  let result: State | undefined = newState;

  if (type === '+') {
    if (autoCloseChar !== undefined && allowAutoComplete) {
      result = {
        code: spliceString(newState.code, endOffset, 0, autoCloseChar),
        cursorOffset: endOffset,
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
        const deleteCount = lineBeforeCursor.length + 1;
        result = {
          code: spliceString(code, cursorOffset - deleteCount, deleteCount),
          cursorOffset: cursorOffset - deleteCount,
        };
      }
    }
  }

  return result;
}
