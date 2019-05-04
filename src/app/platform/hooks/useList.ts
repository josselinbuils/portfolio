import { useMemo, useState } from 'react';

export function useList<T>(): [T[], ListManager<T>] {
  const [list, setList] = useState<T[]>([]);
  const manager = useMemo(
    () => ({
      clear: () => setList([]),
      push: (item: T) => setList(l => [...l, item]),
      update: () => setList(l => [...l])
    }),
    []
  );
  return [list, manager];
}

interface ListManager<T> {
  clear: () => void;
  push: (item: T) => void;
  update: () => void;
}
