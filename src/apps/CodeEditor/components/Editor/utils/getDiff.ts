import { Diff } from '../interfaces';

export function getDiff(a: string, b: string): Diff {
  const isAddition = b.length > a.length;
  const longer = isAddition ? b : a;
  const shorter = isAddition ? a : b;
  const startOffset = longer
    .split('')
    .findIndex((value, index) => shorter.charAt(index) !== value);
  let diff = '';

  for (
    let i = startOffset;
    i < longer.length && longer.slice(i) !== shorter.slice(i - diff.length);
    i++
  ) {
    diff = `${diff}${longer.charAt(i)}`;
  }

  return {
    diff,
    endOffset: isAddition ? startOffset + diff.length : startOffset,
    startOffset: isAddition ? startOffset : startOffset + diff.length,
    type: isAddition ? '+' : '-',
  };
}
