import { type MutableRefObject } from 'preact/compat';
import { useRef } from 'preact/hooks';

export function useDynamicRef<T>(value: T): MutableRefObject<T> {
  const ref = useRef<T>(value);
  // eslint-disable-next-line react-hooks/refs
  ref.current = value;
  return ref;
}
