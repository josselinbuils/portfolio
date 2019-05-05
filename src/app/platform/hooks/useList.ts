import { useMemo, useState } from 'react';

export function useList<T>(): [T[], ListManager<T>] {
  const [list, setList] = useState<T[]>([]);
  const manager = useMemo(
    () => ({
      clear: () => setList([]),
      push: (...items: T[]) => setList(l => [...l, ...items]),
      update: () => setList(l => [...l])
    }),
    []
  );
  return [list, manager];
}

interface ListManager<T> {
  clear: () => void;
  push: (...items: T[]) => void;
  update: () => void;
}
