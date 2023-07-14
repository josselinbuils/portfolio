import { useMemo, useState } from 'preact/compat';

/**
 * Allows managing lists easily.
 */
export function useList<T>(
  initialValues: T[] | (() => T[]) = [],
): [T[], ListManager<T>] {
  const [list, setList] = useState<T[]>(initialValues);
  const manager = useMemo(
    () => ({
      clear: () => setList([]),
      push: (...items: T[]) => setList((l) => [...l, ...items]),
      set: setList,
      update: () => setList((l) => [...l]),
    }),
    [],
  );
  return [list, manager];
}

/**
 * Manager provided by useList.
 */
export interface ListManager<T> {
  clear(): void;
  push(...items: T[]): void;
  set(items: T[] | ((currentItems: T[]) => T[])): void;
  update(): void;
}
