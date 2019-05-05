import { useMemo, useState } from 'react';

export function useList<T>(): [T[], ListManager<T>] {
  const [list, setList] = useState<T[]>([]);
  const manager = useMemo(
    () => ({
      clear: () => setList([]),
      getLast: () => list[list.length - 1],
      push: (...items: T[]) => setList(l => [...l, ...items]),
      update: () => setList(l => [...l])
    }),
    [list]
  );
  return [list, manager];
}

interface ListManager<T> {
  clear: () => void;
  getLast: () => T | undefined;
  push: (...items: T[]) => void;
  update: () => void;
}
