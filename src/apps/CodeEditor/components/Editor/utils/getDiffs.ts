import { Diff } from '../interfaces/Diff';
import { applyDiff } from './applyDiff';

// Sometimes multiple diffs are necessary even for a single change.
// Ex: removing selection by putting a new character that was not the first
// character of the selection.
export function getDiffs(a: string, b: string): Diff[] {
  const diffObjs = [];
  let base = a;

  do {
    const diffObj = getDiff(base, b);
    diffObjs.push(diffObj);
    base = applyDiff(base, diffObj);
  } while (base !== b);

  return diffObjs;
}

function getDiff(a: string, b: string): Diff {
  const isAddition = b.length >= a.length;
  const type = isAddition ? '+' : '-';
  let startOffset = 0;
  let endOffset = 0;
  let diff = '';

  if (a !== b) {
    const longer = isAddition ? b : a;
    const shorter = isAddition ? a : b;

    startOffset = longer
      .split('')
      .findIndex((value, index) => shorter.charAt(index) !== value);

    for (
      let i = startOffset;
      i < longer.length && longer.slice(i) !== shorter.slice(i - diff.length);
      i++
    ) {
      diff = `${diff}${longer.charAt(i)}`;
    }

    endOffset = isAddition ? startOffset + diff.length : startOffset;
    startOffset = isAddition ? startOffset : startOffset + diff.length;
  }

  return { diff, endOffset, startOffset, type };
}
