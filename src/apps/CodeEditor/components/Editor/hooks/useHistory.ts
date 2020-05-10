import { useCallback, useRef } from 'react';
import { useDynamicRef } from '~/platform/hooks/useDynamicRef';
import { useKeyMap } from '~/platform/hooks/useKeyMap';
import { EditableState } from '../interfaces/EditableState';
import {
  applyDiff,
  Diff,
  getCursorOffsetAfterDiff,
  getCursorOffsetBeforeDiff,
  getDiffs,
  revertDiff,
} from '../utils/diffs';

const HISTORY_SIZE_LIMIT = 50;

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
    [fileName: string]: { index: number; states: HistoryState[] };
  }>({});
  const applyStateRef = useDynamicRef(applyState);
  const codeRef = useDynamicRef(code);

  if (historyRef.current[fileName] === undefined) {
    historyRef.current[fileName] = { index: -1, states: [] };
  }

  const fileHistoryRef = useDynamicRef(historyRef.current[fileName]);

  useKeyMap(
    {
      'Control+Z,Meta+Z': () => {
        const { index, states } = fileHistoryRef.current;

        if (index > -1) {
          const newIndex = index - 1;
          const prevCode = states[index].diffs.reduceRight(
            (str, diff) => revertDiff(str, diff),
            codeRef.current
          );
          const prevCursorOffset =
            newIndex >= 0 ? states[newIndex].cursorOffset : 0;

          fileHistoryRef.current.index = newIndex;
          applyStateRef.current({
            code: prevCode,
            cursorOffset: prevCursorOffset,
          });
        }
      },
      'Control+Shift+Z,Meta+Shift+Z': () => {
        const { index, states } = fileHistoryRef.current;

        if (index < states.length - 1) {
          const newIndex = index + 1;
          const { cursorOffset, diffs } = states[newIndex];
          const newCode = diffs.reduce(
            (str, diff) => applyDiff(str, diff),
            codeRef.current
          );

          fileHistoryRef.current.index = newIndex;
          applyStateRef.current({ code: newCode, cursorOffset });
        }
      },
    },
    active
  );

  const pushState = useCallback(
    (newState: EditableState): void => {
      const currentCode = codeRef.current;
      const { index, states } = fileHistoryRef.current;
      const newDiffs = getDiffs(currentCode, newState.code);

      if (index < states.length - 1) {
        states.length = index + 1;
        states.push({
          cursorOffset: newState.cursorOffset,
          diffs: newDiffs,
        });
        fileHistoryRef.current.index = states.length - 1;
      } else {
        if (states.length >= HISTORY_SIZE_LIMIT) {
          states.splice(0, states.length - HISTORY_SIZE_LIMIT + 1);
        }

        if (states.length > 0) {
          const currentState = states[states.length - 1];
          const currentDiffs = currentState.diffs;
          const lastCurrentDiff = currentDiffs[currentDiffs.length - 1] as Diff;

          if (newDiffs.length === 1) {
            const newDiff = newDiffs[0];

            if (
              !/\s/.test(newDiff[2]) &&
              newDiff[0] === lastCurrentDiff[0] &&
              getCursorOffsetBeforeDiff(newDiff) ===
                getCursorOffsetAfterDiff(lastCurrentDiff)
            ) {
              currentState.cursorOffset = newState.cursorOffset;
              currentDiffs.push(newDiff);
              return;
            }
          }
        }
        states.push({
          cursorOffset: newState.cursorOffset,
          diffs: newDiffs,
        });
        fileHistoryRef.current.index = states.length - 1;
      }
    },
    [codeRef, fileHistoryRef]
  );

  return { pushState };
}

interface HistoryState {
  cursorOffset: number;
  diffs: Diff[];
}
