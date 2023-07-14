import { useCallback, useEffect, useReducer, useRef } from 'preact/compat';
import { type ClientState } from '@/apps/CodeEditor/interfaces/ClientState';
import { type EditableState } from '@/apps/CodeEditor/interfaces/EditableState';
import { type Selection } from '@/apps/CodeEditor/interfaces/Selection';
import { createSelection } from '@/apps/CodeEditor/utils/createSelection';
import { type Diff } from '@/apps/CodeEditor/utils/diffs';
import {
  applyDiff,
  getCursorOffsetAfterDiff,
  getDiffs,
} from '@/apps/CodeEditor/utils/diffs';
import { minifySelection } from '@/apps/CodeEditor/utils/minifySelection';
import { useDynamicRef } from '@/platform/hooks/useDynamicRef';
import { useKeyMap } from '@/platform/hooks/useKeyMap';
import { createReducer } from '@/platform/state/utils/createReducer';
import { computeHash } from '@/platform/utils/computeHash';
import { dispatchToServer, registerClient } from '../../utils/shareState';
import * as actions from './clientActions';
import * as serverActions from './serverActions';

const DEBUG = false;

const initialState: ClientState = {
  id: -1,
  code: '',
  cursorColor: 'transparent',
  cursors: [],
  selection: createSelection(0),
};

const reducer = createReducer(Object.values(actions));

export function useSharedFile({
  active,
  applyClientState,
  code,
  filename,
  selection,
}: {
  active: boolean;
  code: string;
  filename: string;
  selection: Selection;
  applyClientState(clientState: ClientState): any;
}): {
  updateClientState(newState: EditableState): void;
  updateSelection(selection: Selection): void;
} {
  const [clientState, dispatch] = useReducer(reducer, initialState);
  const applyClientStateRef = useDynamicRef(applyClientState);
  const clientCodeRef = useRef(clientState.code);
  const codeRef = useDynamicRef(code);
  const selectionRef = useDynamicRef(selection);
  const lastCursorOffsetSentRef = useRef<Selection>([0, 0]);
  const hashToWaitForRef = useRef<string>();
  const updateQueueRef = useRef<Diff[]>([]);

  useKeyMap(
    {
      'Control+Z,Meta+Z': () =>
        dispatchToServer(serverActions.undo.create({ f: filename })),
      'Control+Shift+Z,Meta+Shift+Z': () =>
        dispatchToServer(serverActions.redo.create({ f: filename })),
    },
    active,
  );

  useEffect(() => {
    if (active) {
      return registerClient(dispatch);
    }
    dispatch(actions.applyState.create({ s: initialState }));
  }, [active]);

  useEffect(() => {
    if (active) {
      dispatchToServer(serverActions.subscribe.create({ f: filename }));
      dispatchToServer(
        serverActions.updateClientSelection.create({
          f: filename,
          s: minifySelection(selectionRef.current),
        }),
      );
    }
  }, [active, filename, selectionRef]);

  useEffect(() => {
    if (!active || clientState === undefined) {
      return;
    }
    applyClientStateRef.current(clientState);

    const previousCode = clientCodeRef.current;
    clientCodeRef.current = clientState.code;
    const currentHash = computeHash(clientState.code);

    if (updateQueueRef.current.length > 0) {
      if (currentHash !== hashToWaitForRef.current) {
        if (clientState.code !== clientCodeRef.current) {
          // We received a not expected state. As the server is always right,
          // we have to deal with it
          updateQueueRef.current.length = 0;
          hashToWaitForRef.current = currentHash;

          if (DEBUG) {
            console.error('empty queue');
          }
          return;
        }
        // We received a state update without code change
        if (DEBUG) {
          console.debug('wait before sending', updateQueueRef.current[0]);
        }
        return;
      }

      const diff = updateQueueRef.current.shift() as Diff;

      if (DEBUG) {
        console.debug('dequeue', diff, currentHash, clientState.code);
      }

      diff[1] = clientState.selection[0];

      const newCursorOffset = getCursorOffsetAfterDiff(
        diff,
        clientState.selection[0],
      );
      const newSelection = createSelection(newCursorOffset);
      const action = serverActions.updateCode.create({
        cs: clientState.selection,
        d: [diff],
        f: filename,
        ns: newSelection,
        sh: currentHash,
      });

      dispatchToServer(action);
      lastCursorOffsetSentRef.current = newSelection;
      hashToWaitForRef.current = computeHash(applyDiff(clientState.code, diff));
    } else if (
      hashToWaitForRef.current === undefined ||
      clientState.code !== previousCode
    ) {
      if (DEBUG) {
        console.debug(`reset hashToWaitFor to ${currentHash}`);
      }
      hashToWaitForRef.current = currentHash;
    }
  }, [active, applyClientStateRef, clientState, clientCodeRef, filename]);

  const updateClientState = useCallback(
    (newState: EditableState) => {
      if (!active) {
        return;
      }
      const currentHash = computeHash(clientCodeRef.current);
      const updateQueue = updateQueueRef.current;
      const diffs = getDiffs(codeRef.current, newState.code);

      if (DEBUG) {
        console.debug('updateClientState()', newState);
      }

      if (
        currentHash === hashToWaitForRef.current &&
        updateQueue.length === 0
      ) {
        const action = serverActions.updateCode.create({
          cs: selectionRef.current,
          d: diffs,
          f: filename,
          ns: newState.selection,
          sh: currentHash,
        });

        if (DEBUG) {
          console.debug('send directly', diffs);
        }
        hashToWaitForRef.current = computeHash(newState.code);
        lastCursorOffsetSentRef.current = newState.selection;
        dispatchToServer(action);
      } else {
        if (diffs.length > 1) {
          if (DEBUG) {
            console.debug({ diffs });
          }
          throw new Error('Cannot queue multiple diffs');
        }
        if (DEBUG) {
          console.debug('enqueue', diffs[0]);
        }
        updateQueue.push(diffs[0]);
      }
    },
    [active, codeRef, filename, selectionRef],
  );

  const updateSelection = useCallback(
    (newSelection: Selection) => {
      const currentHash = computeHash(clientCodeRef.current);

      if (
        currentHash === hashToWaitForRef.current &&
        updateQueueRef.current.length === 0 &&
        (newSelection[0] !== lastCursorOffsetSentRef.current[0] ||
          newSelection[1] !== lastCursorOffsetSentRef.current[1])
      ) {
        dispatchToServer(
          serverActions.updateClientSelection.create({
            f: filename,
            s: minifySelection(newSelection),
          }),
        );
        lastCursorOffsetSentRef.current = createSelection(newSelection);
      }
    },
    [filename],
  );

  return {
    updateClientState,
    updateSelection,
  };
}
