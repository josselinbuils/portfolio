import { diff_match_patch as DiffMatchPatch } from 'diff-match-patch';
import { spliceString } from './spliceString';

const MAX_DIFFS = 10000;

export function applyDiff(
  code: string,
  [start, deleteCount, diff]: Diff
): string {
  return spliceString(code, start, deleteCount, diff);
}

export function getCursorOffsetAfterDiff([start, _, diff]: Diff): number {
  return start + diff.length;
}

export function getCursorOffsetBeforeDiff([start, deleteCount]: Diff): number {
  return start + deleteCount;
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
      throw new Error('Max allowed number of diffs reached');
    }
  }

  return diffObjs;
}

export function getDiffType([_, deleteCount, diff]: Diff): number {
  if (diff.length === 0) {
    return 0;
  }
  return deleteCount > 0 ? -1 : 1;
}

function getFirstDiff(a: string, b: string): Diff {
  const diffs = new DiffMatchPatch().diff_main(a, b);
  let offset = 0;

  for (const [type, diff] of diffs) {
    switch (type) {
      case -1:
        return [offset, diff.length, ''];

      case 0:
        offset += diff.length;
        break;

      case 1:
        return [offset, 0, diff];
    }
  }
  return [0, 0, ''];
}

/** [start, deleteCount, diff] */
export type Diff = [number, number, string];
