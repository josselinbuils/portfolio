import { useCallback, useRef } from 'preact/compat';
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
  code: string;
  fileName: string;
  selection: Selection;
  applyState(state: EditableState): any;
}): {
  pushState(state: EditableState): void;
} {
  const historyRef = useRef<{
    [fileName: string]: History;
  }>({});
  const applyStateRef = useDynamicRef(applyState);
  const currentStateRef = useDynamicRef({ code, selection });

  if (historyRef.current[fileName] === undefined) {
    historyRef.current[fileName] = new History();
  }

  const fileHistoryRef = useDynamicRef(historyRef.current[fileName]);

  useKeyMap(
    {
      'CtrlCmd+Z': () => {
        const previousState = fileHistoryRef.current.undo(
          currentStateRef.current.code,
        );

        if (previousState !== undefined) {
          applyStateRef.current(previousState);
        }
      },
      'CtrlCmd+Shift+Z': () => {
        const newState = fileHistoryRef.current.redo(
          currentStateRef.current.code,
        );

        if (newState !== undefined) {
          applyStateRef.current(newState);
        }
      },
    },
    active,
  );

  const pushState = useCallback(
    (newState: EditableState): void => {
      fileHistoryRef.current.pushState(currentStateRef.current, newState);
    },
    [currentStateRef, fileHistoryRef],
  );

  return { pushState };
}
