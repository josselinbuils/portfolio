import { Change } from '../../interfaces';
import { getDiff } from '../getDiff';
import { isCodePortionEnd } from '../isCodePortionEnd';
import { isIntoAutoCloseGroup } from '../isIntoAutoCloseGroup';
import { spliceString } from '../spliceString';
import { getAutoCloseChar, isAutoCloseChar } from './utils';

export function autoEditChange(
  code: string,
  cursorOffset: number,
  change: Change
): Change | undefined {
  const { diff, endOffset } = change.diffObj;
  const autoCloseChar = getAutoCloseChar(diff);
  const allowAutoComplete = isCodePortionEnd(code, cursorOffset);
  let result: Change | undefined = change;

  if (autoCloseChar !== undefined && allowAutoComplete) {
    const newCode = spliceString(change.newCode, endOffset, 0, autoCloseChar);
    result = {
      newCode,
      diffObj: getDiff(code, newCode),
      cursorOffsetAfter: endOffset,
    };
  } else if (
    isIntoAutoCloseGroup(code, cursorOffset) &&
    isAutoCloseChar(diff)
  ) {
    result = undefined;
  }

  return result;
}
