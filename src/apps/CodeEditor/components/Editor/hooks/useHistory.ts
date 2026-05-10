import { useCallback, useMemo } from 'preact/hooks';

import { type EditableState } from '@/apps/CodeEditor/interfaces/EditableState';
import { type Selection } from '@/apps/CodeEditor/interfaces/Selection';
import { History } from '@/apps/CodeEditor/utils/History';
import { useDynamicRef } from '@/platform/hooks/useDynamicRef';
import { useKeyMap } from '@/platform/hooks/useKeyMap';

export function useHistory({
  active,
  applyState,
  code,
  fileName,
  selection,
}: {
  active: boolean;
  applyState(state: EditableState): any;
  code: string;
  fileName: string;
  selection: Selection;
}): {
  pushState(state: EditableState): void;
} {
  const historyByFile = useMemo(() => new Map<string, History>(), []);
  const applyStateRef = useDynamicRef(applyState);
  const currentStateRef = useDynamicRef({ code, selection });

  if (!historyByFile.has(fileName)) {
    historyByFile.set(fileName, new History());
  }

  const fileHistory = historyByFile.get(fileName);

  useKeyMap(
    {
      'CtrlCmd+Shift+Z': () => {
        const newState = fileHistory?.redo(currentStateRef.current.code);

        if (newState !== undefined) {
          applyStateRef.current(newState);
        }
      },
      'CtrlCmd+Z': () => {
        const previousState = fileHistory?.undo(currentStateRef.current.code);

        if (previousState !== undefined) {
          applyStateRef.current(previousState);
        }
      },
    },
    active,
  );

  const pushState = useCallback(
    (newState: EditableState): void => {
      fileHistory?.pushState(currentStateRef.current, newState);
    },
    [currentStateRef, fileHistory],
  );

  return { pushState };
}
