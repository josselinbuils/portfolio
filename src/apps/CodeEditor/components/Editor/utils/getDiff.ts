import { Diff } from '../interfaces';

export function getDiff(a: string, b: string): Diff {
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
