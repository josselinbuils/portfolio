import { useMemo } from 'react';

export function useObject<T extends object>(value: T): T {
  return useMemo<T>(() => value, []);
}
