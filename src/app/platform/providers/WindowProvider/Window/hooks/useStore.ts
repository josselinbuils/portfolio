import { useMemo } from 'react';

export function useStore<T extends object>(): T {
  return useMemo<T>(() => ({} as T), []);
}
