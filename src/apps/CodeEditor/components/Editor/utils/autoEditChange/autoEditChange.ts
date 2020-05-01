import { State } from '../../interfaces';
import { getDiff } from '../getDiff';
import { isCodePortionEnd } from '../isCodePortionEnd';
import { isIntoAutoCloseGroup } from '../isIntoAutoCloseGroup';
import { spliceString } from '../spliceString';
import { getAutoCloseChar, isAutoCloseChar } from './utils';

export function autoEditChange(
  currentState: State,
  newState: State
): State | undefined {
  const { diff, endOffset } = getDiff(currentState.code, newState.code);
  const autoCloseChar = getAutoCloseChar(diff);
  const allowAutoComplete = isCodePortionEnd(
    currentState.code,
    currentState.cursorOffset
  );
  let result: State | undefined = newState;

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
  }

  return result;
}
