import { type StateUpdater } from 'preact/compat';
import { useCallback, useRef, useState } from 'preact/compat';

export function useMemState<S>(
  initialValue: S | (() => S),
): [S, S | undefined, StateUpdater<S>] {
  const [value, setValue] = useState<S>(initialValue);
  const previousValueRef = useRef<S>();

  const setValues = useCallback((newValue: S | ((prevState: S) => S)): void => {
    setValue((previousValue) => {
      previousValueRef.current = previousValue;

      return typeof newValue === 'function'
        ? (newValue as (prevState: S) => S)(previousValue)
        : newValue;
    });
  }, []);

  return [value, previousValueRef.current, setValues];
}
