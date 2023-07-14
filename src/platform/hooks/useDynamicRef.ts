import { type MutableRefObject, useRef } from 'preact/compat';

export function useDynamicRef<T>(value: T): MutableRefObject<T> {
  const ref = useRef<T>(value);
  ref.current = value;
  return ref;
}
