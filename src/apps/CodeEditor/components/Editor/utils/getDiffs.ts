import { diff_match_patch as DiffMatchPatch } from 'diff-match-patch';
import { Diff } from '../interfaces/Diff';
import { applyDiff } from './applyDiff';

const MAX_DIFFS = 10000;

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

function getFirstDiff(a: string, b: string): Diff {
  const diffs = new DiffMatchPatch().diff_main(a, b);
  let offset = 0;

  for (const [type, diff] of diffs) {
    switch (type) {
      case -1:
        return {
          type: '-',
          startOffset: offset + diff.length,
          endOffset: offset,
          diff,
        };

      case 0:
        offset += diff.length;
        break;

      case 1:
        return {
          type: '+',
          startOffset: offset,
          endOffset: offset + diff.length,
          diff,
        };
    }
  }
  return {
    type: '+',
    startOffset: 0,
    endOffset: 0,
    diff: '',
  };
}
