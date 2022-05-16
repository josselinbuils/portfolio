import { useDynamicRef } from '@josselinbuils/hooks/useDynamicRef';
import { useKeyMap } from '@josselinbuils/hooks/useKeyMap';
import { Deferred } from '@josselinbuils/utils/Deferred';
import { Reducer, useCallback, useEffect, useReducer, useRef } from 'react';
import { Action } from '~/apps/CodeEditor/interfaces/actions';
import { ClientState } from '~/apps/CodeEditor/interfaces/ClientState';
import { EditableState } from '~/apps/CodeEditor/interfaces/EditableState';
import { Selection } from '~/apps/CodeEditor/interfaces/Selection';
import { computeHash } from '~/apps/CodeEditor/utils/computeHash';
import { createSelection } from '~/apps/CodeEditor/utils/createSelection';
import {
  applyDiff,
  Diff,
  getCursorOffsetAfterDiff,
  getDiffs,
} from '~/apps/CodeEditor/utils/diffs';
import { cancelable } from '~/platform/utils/cancelable';
import { createAction } from './utils/createAction';
import { handleAction } from './utils/handleAction';

const DEBUG = false;
const REOPEN_DELAY_MS = 1000;
const WS_API_PATHNAME = '/api/CodeEditor/ws';

const initialState: ClientState = {
  id: -1,
  code: '',
  cursorColor: 'transparent',
  cursors: [],
  selection: createSelection(0),
};

const reducer = ((clientState, action) =>
  handleAction[action[0]]?.(clientState, action) || clientState) as Reducer<
  ClientState,
  Action
>;

export function useSharedFile({
  active,
  code,
  applyClientState,
  selection,
}: {
  active: boolean;
  code: string;
  selection: Selection;
  applyClientState(clientState: ClientState): any;
}): {
  updateClientState(newState: EditableState): void;
  updateSelection(selection: Selection): void;
} {
  const dispatchToServerRef = useRef<(action: Action) => void>(() => {});
  const [clientState, dispatch] = useReducer(reducer, initialState);
  const applyClientStateRef = useDynamicRef(applyClientState);
  const clientCodeRef = useRef(clientState.code);
  const codeRef = useDynamicRef(code);
  const selectionRef = useDynamicRef(selection);
  const lastCursorOffsetSentRef = useRef<Selection>([0, 0]);
  const hashToWaitForRef = useRef<number>();
  const updateQueueRef = useRef<Diff[]>([]);

  useKeyMap(
    {
      'Control+Z,Meta+Z': () =>
        dispatchToServerRef.current(createAction.undo()),
      'Control+Shift+Z,Meta+Shift+Z': () =>
        dispatchToServerRef.current(createAction.redo()),
    },
    active
  );

  useEffect(() => {
    if (!active) {
      return;
    }
    const [wsReadyPromise, cancelWsReadyPromise] = cancelable(
      fetch(WS_API_PATHNAME)
    );
    let maintainOpen = true;
    let reopenTimeoutID: number | undefined;
    let ws: WebSocket | undefined;

    function openSocket(): void {
      wsReadyPromise.then(() => {
        const { host, protocol } = window.location;
        const wsProtocol = protocol === 'https:' ? `wss:` : `ws:`;
        const readyDeferred = new Deferred<void>();

        ws = new WebSocket(`${wsProtocol}//${host}${WS_API_PATHNAME}`);

        dispatchToServerRef.current = async (action: Action) => {
          await readyDeferred.promise;
          ws?.send(JSON.stringify(action));
        };

        ws.onclose = () => {
          if (maintainOpen) {
            reopenTimeoutID = window.setTimeout(openSocket, REOPEN_DELAY_MS);
          }
        };
        ws.onopen = () => {
          readyDeferred.resolve();
          dispatchToServerRef.current(
            createAction.updateSelection(selectionRef.current)
          );
        };
        ws.onmessage = (event) => {
          try {
            const action = JSON.parse(event.data) as Action;
            dispatch(action);
          } catch (error) {
            console.error(error);
          }
        };
      });
    }
    openSocket();

    return () => {
      maintainOpen = false;
      cancelWsReadyPromise();
      clearTimeout(reopenTimeoutID);
      dispatchToServerRef.current = () => {};
      ws?.close();
      dispatch(createAction.updateClientState(initialState));
    };
  }, [active, selectionRef]);

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
        clientState.selection[0]
      );
      const newSelection = createSelection(newCursorOffset);
      const action = createAction.updateCode(
        clientState.selection,
        [diff],
        newSelection,
        currentHash
      );

      dispatchToServerRef.current(action);
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
  }, [active, applyClientStateRef, clientState, clientCodeRef]);

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
        const action = createAction.updateCode(
          selectionRef.current,
          diffs,
          newState.selection,
          currentHash
        );

        if (DEBUG) {
          console.debug('send directly', diffs);
        }
        hashToWaitForRef.current = computeHash(newState.code);
        lastCursorOffsetSentRef.current = newState.selection;
        dispatchToServerRef.current(action);
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
    [active, codeRef, selectionRef]
  );

  const updateSelection = useCallback((newSelection: Selection) => {
    const currentHash = computeHash(clientCodeRef.current);

    if (
      currentHash === hashToWaitForRef.current &&
      updateQueueRef.current.length === 0 &&
      (newSelection[0] !== lastCursorOffsetSentRef.current[0] ||
        newSelection[1] !== lastCursorOffsetSentRef.current[1])
    ) {
      const action = createAction.updateSelection(newSelection);
      dispatchToServerRef.current(action);
      lastCursorOffsetSentRef.current = { ...newSelection };
    }
  }, []);

  return {
    updateClientState,
    updateSelection,
  };
}
