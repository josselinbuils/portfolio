import { useCallback, useRef } from 'react';
import { EditableState } from '~/apps/CodeEditor/interfaces/EditableState';
import { History } from '~/apps/CodeEditor/utils/History';
import { useDynamicRef } from '~/platform/hooks/useDynamicRef';
import { useKeyMap } from '~/platform/hooks/useKeyMap';

export function useHistory({
  active,
  code,
  cursorOffset,
  applyState,
  fileName,
}: {
  active: boolean;
  code: string;
  cursorOffset: number;
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
  const cursorOffsetRef = useDynamicRef(cursorOffset);

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
      fileHistoryRef.current.pushState(
        codeRef.current,
        cursorOffsetRef.current,
        newState
      );
    },
    [codeRef, fileHistoryRef]
  );

  return { pushState };
}
