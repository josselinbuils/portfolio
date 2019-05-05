import { EffectCallback, useEffect } from 'react';

export function useChangeDetector(value: any, callback: EffectCallback): void {
  useEffect(callback, [value]);
}
