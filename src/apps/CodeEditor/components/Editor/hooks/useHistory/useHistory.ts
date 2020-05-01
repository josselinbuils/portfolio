import { useCallback, useRef } from 'react';
import { useDynamicRef, useKeyMap } from '~/platform/hooks';
import { Diff, State } from '../../interfaces';
import { getDiff } from '../../utils';

const HISTORY_SIZE_LIMIT = 50;

export function useHistory<T>({
  applyState,
  fileName,
}: {
  fileName: string;
  applyState(state: State): any;
}): {
  pushState(state: State): void;
} {
  const historyRef = useRef<{
    [fileName: string]: { index: number; states: StateWithDiff[] };
  }>({});
  const applyStateRef = useDynamicRef(applyState);

  if (historyRef.current[fileName] === undefined) {
    historyRef.current[fileName] = { index: -1, states: [] };
  }

  const fileHistoryRef = useDynamicRef(historyRef.current[fileName]);

  useKeyMap({
    'Control+Z,Meta+Z': () => {
      const { index, states } = fileHistoryRef.current;

      if (index > 0) {
        const newIndex = index - 1;
        fileHistoryRef.current.index = newIndex;
        applyStateRef.current(states[newIndex]);
      }
    },
    'Control+Shift+Z,Meta+Shift+Z': () => {
      const { index, states } = fileHistoryRef.current;

      if (index < states.length - 1) {
        const newIndex = index + 1;
        fileHistoryRef.current.index = newIndex;
        applyStateRef.current(states[newIndex]);
      }
    },
  });

  const pushState = useCallback(
    (newState: StateWithDiff): void => {
      const { index, states } = fileHistoryRef.current;

      if (index < states.length - 1) {
        states.length = index + 1;
        states.push(newState);
        fileHistoryRef.current.index = states.length - 1;
      } else {
        if (states.length >= HISTORY_SIZE_LIMIT) {
          states.splice(0, states.length - HISTORY_SIZE_LIMIT + 1);
        }

        if (states.length > 0) {
          const currentState = states[states.length - 1];
          const currentDiffObj = currentState.diffObj;
          const newDiffObj = getDiff(currentState.code, newState.code);

          newState.diffObj = newDiffObj;

          if (
            !/\s/.test(newState.diffObj.diff) &&
            currentDiffObj !== undefined &&
            newDiffObj.type === currentDiffObj.type &&
            newDiffObj.startOffset === currentDiffObj.endOffset
          ) {
            currentState.code = newState.code;
            currentState.cursorOffset = newState.cursorOffset;
            currentDiffObj.diff = `${currentDiffObj.diff}${newDiffObj.diff}`;
            currentDiffObj.endOffset = newDiffObj.endOffset;
            return;
          }
        }
        states.push(newState);
        fileHistoryRef.current.index = states.length - 1;
      }
    },
    [fileHistoryRef]
  );

  return { pushState };
}

interface StateWithDiff extends State {
  diffObj?: Diff;
}
