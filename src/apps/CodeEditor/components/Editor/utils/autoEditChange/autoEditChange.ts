import { INDENT } from '../../constants';
import { State } from '../../interfaces';
import { getDiff } from '../getDiff';
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
      const indent = getLineIndent(code, cursorOffset);
      const indentSpaces = ' '.repeat(indent);
      const additionalSpaces =
        isOpenBracket(code[cursorOffset - 1]) || code[cursorOffset - 1] === ':'
          ? INDENT
          : '';

      if (isIntoBrackets(code, cursorOffset)) {
        const insertion = `\n${indentSpaces}${additionalSpaces}\n${indentSpaces}`;
        result = {
          code: spliceString(code, cursorOffset, 0, insertion),
          cursorOffset: cursorOffset + indent + additionalSpaces.length + 1,
        };
      } else {
        const insertion = `\n${indentSpaces}${additionalSpaces}`;
        result = {
          code: spliceString(code, cursorOffset, 0, insertion),
          cursorOffset: cursorOffset + indent + additionalSpaces.length + 1,
        };
      }
    }
  } else {
    const { code, cursorOffset } = currentState;

    if (isIntoAutoCloseGroup(code, cursorOffset)) {
      result = {
        code: spliceString(code, cursorOffset - 1, 2),
        cursorOffset: newState.cursorOffset,
      };
    } else {
      const lineBeforeCursor = getLineBeforeCursor(code, cursorOffset);

      if (/^ +$/.test(lineBeforeCursor)) {
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
