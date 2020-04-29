import { useEffect, useRef, useState } from 'react';
import { useKeyMap, useList } from '~/platform/hooks';
import { Diff } from '../../interfaces';

export function useHistory({
  redo,
  undo,
}: {
  redo(diff: Diff): any;
  undo(diff: Diff): any;
}): {
  pushHistory(diff: Diff | Diff[]): void;
} {
  const [history, historyManager] = useList<Diff>();
  const [historyIndex, setHistoryIndex] = useState(-1);
  const redoRef = useRef<(diff: Diff) => any>(redo);
  const undoRef = useRef<(diff: Diff) => any>(undo);

  redoRef.current = redo;
  undoRef.current = undo;

  useKeyMap({
    'Control+Z,Meta+Z': () => {
      if (historyIndex > -1) {
        const diff = history[historyIndex];

        setHistoryIndex(historyIndex - 1);

        if (Array.isArray(diff)) {
          diff
            .slice()
            .reverse()
            .forEach((subDiff) => {
              undoRef.current(subDiff);
            });
        } else {
          undoRef.current(diff);
        }
      }
    },
    'Control+Shift+Z,Meta+Shift+Z': () => {
      if (historyIndex < history.length - 1) {
        const diff = history[historyIndex + 1];

        setHistoryIndex(historyIndex + 1);

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

  useEffect(() => {
    setHistoryIndex(history.length - 1);
  }, [history]);

  function pushHistory(diff: Diff): void {
    if (historyIndex < history.length - 1) {
      historyManager.set([...history.slice(0, historyIndex), diff]);
    } else {
      historyManager.push(diff);
    }
  }

  return { pushHistory };
}
