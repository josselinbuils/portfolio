import { useCallback, useRef } from 'react';
import { useDynamicRef } from '~/platform/hooks/useDynamicRef';
import { useKeyMap } from '~/platform/hooks/useKeyMap';
import { EditableState } from '../../interfaces/EditableState';
import { History } from './History';

export function useHistory<T>({
  active,
  code,
  applyState,
  fileName,
}: {
  active: boolean;
  code: string;
  fileName: string;
  applyState(state: EditableState): any;
}): {
  pushState(state: EditableState): void;
} {
  const historyRef = useRef<{
    [fileName: string]: History;
  }>({});
  const applyStateRef = useDynamicRef(applyState);
  const codeRef = useDynamicRef(code);

  if (historyRef.current[fileName] === undefined) {
    historyRef.current[fileName] = new History();
  }

  const fileHistoryRef = useDynamicRef(historyRef.current[fileName]);

  useKeyMap(
    {
      'Control+Z,Meta+Z': () => {
        const previousState = fileHistoryRef.current.undo(codeRef.current);

        if (previousState !== undefined) {
          applyStateRef.current(previousState);
        }
      },
      'Control+Shift+Z,Meta+Shift+Z': () => {
        const newState = fileHistoryRef.current.redo(codeRef.current);

        if (newState !== undefined) {
          applyStateRef.current(newState);
        }
      },
    },
    active
  );

  const pushState = useCallback(
    (newState: EditableState): void => {
      fileHistoryRef.current.pushState(codeRef.current, newState);
    },
    [codeRef, fileHistoryRef]
  );

  return { pushState };
}
