import { useCallback, useRef } from 'react';
import { useDynamicRef, useKeyMap } from '~/platform/hooks';
import { Diff } from '../../interfaces';

const HISTORY_SIZE_LIMIT = 100;

export function useHistory({
  redo,
  undo,
}: {
  redo(diff: Diff): any;
  undo(diff: Diff, cursorOffsetBefore?: number): any;
}): {
  pushHistory(diff: Diff | Diff[]): void;
} {
  const historyRef = useRef<(Diff | Diff[])[]>([]);
  const historyIndexRef = useRef(-1);
  const redoRef = useDynamicRef<(diff: Diff) => any>(redo);
  const undoRef = useDynamicRef<
    (diff: Diff, cursorOffsetBefore?: number) => any
  >(undo);

  useKeyMap({
    'Control+Z,Meta+Z': () => {
      const historyIndex = historyIndexRef.current;

      if (historyIndex > -1) {
        const history = historyRef.current;
        const diff = history[historyIndex];
        const prevDiff = getLastSubDiff(history[historyIndex - 1]);
        const cursorOffsetBefore =
          prevDiff?.cursorOffsetAfter || prevDiff?.endOffset;

        historyIndexRef.current = historyIndex - 1;

        if (Array.isArray(diff)) {
          diff
            .slice()
            .reverse()
            .forEach((subDiff) => {
              undoRef.current(subDiff, cursorOffsetBefore);
            });
        } else {
          undoRef.current(diff, cursorOffsetBefore);
        }
      }
    },
    'Control+Shift+Z,Meta+Shift+Z': () => {
      const history = historyRef.current;
      const historyIndex = historyIndexRef.current;

      if (historyIndex < history.length - 1) {
        const diff = history[historyIndex + 1];

        historyIndexRef.current = historyIndex + 1;

        if (Array.isArray(diff)) {
          diff.forEach((subDiff) => {
            redoRef.current(subDiff);
          });
        } else {
          redoRef.current(diff);
        }
      }
    },
  });

  const pushHistory = useCallback((diff: Diff): void => {
    const history = historyRef.current;
    const historyIndex = historyIndexRef.current;

    if (historyIndex < history.length - 1) {
      history.length = historyIndex + 1;
      history.push(diff);
      historyIndexRef.current = history.length - 1;
    } else {
      if (history.length >= HISTORY_SIZE_LIMIT) {
        history.splice(0, history.length - HISTORY_SIZE_LIMIT + 1);
      }

      const lastSubDiff = getLastSubDiff(history[history.length - 1]);

      if (
        history.length > 0 &&
        !/\s/.test(diff.diff) &&
        diff.startOffset === lastSubDiff.endOffset
      ) {
        const lastDiff = history[history.length - 1];

        if (!Array.isArray(lastDiff)) {
          history[history.length - 1] = [lastDiff, diff];
        } else {
          lastDiff.push(diff);
        }
      } else {
        history.push(diff);
        historyIndexRef.current = history.length - 1;
      }
    }
  }, []);

  return { pushHistory };
}

function getLastSubDiff(diff: Diff | Diff[]): Diff {
  return (Array.isArray(diff) ? diff.slice().pop() : diff) as Diff;
}
