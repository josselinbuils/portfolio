import { useEffect } from 'react';

export function useMount(func: () => void): void {
  useEffect(func, []);
}
