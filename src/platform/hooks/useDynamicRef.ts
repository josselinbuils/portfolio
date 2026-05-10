import { type MutableRefObject, useRef } from 'preact/compat';

export function useDynamicRef<T>(value: T): MutableRefObject<T> {
  const ref = useRef<T>(value);
  // eslint-disable-next-line react-hooks/refs
  ref.current = value;
  return ref;
}
