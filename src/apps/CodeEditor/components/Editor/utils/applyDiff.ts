import { Diff } from '../interfaces/Diff';
import { spliceString } from './spliceString';

export function applyDiff(code: string, diffObj: Diff): string {
  return diffObj.type === '+'
    ? spliceString(code, diffObj.startOffset, 0, diffObj.diff)
    : spliceString(code, diffObj.endOffset, diffObj.diff.length);
}
