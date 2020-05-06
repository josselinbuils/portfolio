import { Diff } from '../../../interfaces';
import { spliceString } from '../../../utils';

export function applyDiff(code: string, diffObj: Diff): string {
  return diffObj.type === '+'
    ? spliceString(code, diffObj.startOffset, 0, diffObj.diff)
    : spliceString(code, diffObj.endOffset, diffObj.diff.length);
}
