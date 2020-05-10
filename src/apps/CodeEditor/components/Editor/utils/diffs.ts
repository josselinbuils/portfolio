import { diff_match_patch as DiffMatchPatch } from 'diff-match-patch';
import { spliceString } from './spliceString';

const MAX_DIFFS = 10000;

export enum DiffType {
  Addition = 1,
  Deletion = -1,
  NoDiff = 0,
}

export function applyDiff(code: string, [type, start, diff]: Diff): string {
  return type === DiffType.Addition
    ? spliceString(code, start, 0, diff)
    : spliceString(code, start, diff.length);
}

export function getCursorOffsetAfterDiff([type, start, diff]: Diff): number {
  return type === DiffType.Addition ? start + diff.length : start;
}

export function getCursorOffsetBeforeDiff([type, start, diff]: Diff): number {
  return type === DiffType.Addition ? start : start + diff.length;
}

// Sometimes multiple diffs are necessary even for a single change.
// Ex: removing selection by putting a new character that was not the first
// character of the selection.
export function getDiffs(a: string, b: string): Diff[] {
  const diffObjs = [];
  let base = a;

  for (let i = 0; base !== b; i++) {
    const diffObj = getFirstDiff(base, b);
    diffObjs.push(diffObj);
    base = applyDiff(base, diffObj);

    if (i >= MAX_DIFFS) {
      const parts = [
        'Max allowed number of diffs reached',
        '############################################################',
        a,
        '############################################################',
        b,
      ];
      throw new Error(parts.join('\n'));
    }
  }

  return diffObjs;
}

function getFirstDiff(a: string, b: string): Diff {
  const diffs = new DiffMatchPatch().diff_main(a, b);
  let offset = 0;

  for (const [type, diff] of diffs) {
    if (type === DiffType.NoDiff) {
      offset += diff.length;
    } else {
      return [type, offset, diff];
    }
  }
  return [0, 0, ''];
}

/** [type, start, diff] */
export type Diff = [number, number, string];
