import { Deferred } from '@josselinbuils/utils';
import { Reducer, useCallback, useEffect, useReducer, useRef } from 'react';
import { useDynamicRef } from '~/platform/hooks/useDynamicRef';
import { useKeyMap } from '~/platform/hooks/useKeyMap';
import { getWSBaseURL } from '~/platform/utils/getWSBaseURL';
import { EditableState } from '../../interfaces/EditableState';
import {
  applyDiff,
  Diff,
  getCursorOffsetAfterDiff,
  getDiffs,
} from '../../utils/diffs';
import { Action } from './interfaces/actions';
import { ClientState } from './interfaces/ClientState';
import { computeHash } from './utils/computeHash';
import { createAction } from './utils/createAction';
import { handleAction } from './utils/handleAction';

const DEBUG = false;
const REOPEN_DELAY_MS = 1000;
const WS_URL = `${getWSBaseURL()}/api/CodeEditor/ws`;

const initialState = {
  id: -1,
  code: '',
  cursorColor: 'transparent',
  cursorOffset: 0,
  cursors: [],
} as ClientState;

const reducer = ((clientState, action) =>
  handleAction[action.type]?.(clientState, action) || clientState) as Reducer<
  ClientState,
  Action
>;

export function useSharedFile({
  active,
  code,
  applyClientState,
  cursorOffset,
}: {
  active: boolean;
  code: string;
  cursorOffset: number;
  applyClientState(clientState: ClientState): any;
}): {
  updateClientState(newState: EditableState): void;
  updateCursorOffset(cursorOffset: number): void;
} {
  const dispatchToServerRef = useRef<(action: Action) => void>(() => {});
  const [clientState, dispatch] = useReducer(reducer, initialState);
  const applyClientStateRef = useDynamicRef(applyClientState);
  const clientCodeRef = useRef(clientState.code);
  const codeRef = useDynamicRef(code);
  const cursorOffsetRef = useDynamicRef(cursorOffset);
  const lastCursorOffsetSentRef = useRef(0);
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
    let maintainOpen = true;
    let reopenTimeoutID: number;
    let ws: WebSocket;

    function openSocket(): void {
      ws = new WebSocket(WS_URL);
      const readyDeferred = new Deferred<void>();

      dispatchToServerRef.current = async (action: Action) => {
        await readyDeferred.promise;
        ws.send(JSON.stringify(action));
      };

      ws.onclose = () => {
        if (maintainOpen) {
          reopenTimeoutID = window.setTimeout(openSocket, REOPEN_DELAY_MS);
        }
      };
      ws.onopen = () => {
        readyDeferred.resolve();
        dispatchToServerRef.current(
          createAction.updateCursorOffset(cursorOffsetRef.current)
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
    }
    openSocket();

    return () => {
      maintainOpen = false;
      clearTimeout(reopenTimeoutID);
      dispatchToServerRef.current = () => {};
      ws.close();
      dispatch(createAction.updateClientState(initialState));
    };
  }, [active, cursorOffsetRef]);

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
          // We received a non expected state. As the server is always right,
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

      diff[1] = clientState.cursorOffset;

      const newCursorOffset = getCursorOffsetAfterDiff(diff);
      const action = createAction.updateCode(
        [diff],
        newCursorOffset,
        currentHash
      );

      dispatchToServerRef.current(action);
      lastCursorOffsetSentRef.current = newCursorOffset;
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
      const newCursorOffset = newState.cursorOffset;
      const diffs = getDiffs(codeRef.current, newState.code);

      if (DEBUG) {
        console.debug('updateClientState()', newState);
      }

      if (
        currentHash === hashToWaitForRef.current &&
        updateQueue.length === 0
      ) {
        const action = createAction.updateCode(
          diffs,
          newCursorOffset,
          currentHash
        );

        if (DEBUG) {
          console.debug('send directly', diffs);
        }
        hashToWaitForRef.current = computeHash(newState.code);
        lastCursorOffsetSentRef.current = newCursorOffset;
        dispatchToServerRef.current(action);
      } else {
        if (diffs.length > 1) {
          throw new Error('Cannot queue multiple diffs');
        }
        if (DEBUG) {
          console.debug('enqueue', diffs[0]);
        }
        updateQueue.push(diffs[0]);
      }
    },
    [active, codeRef]
  );

  const updateCursorOffset = useCallback((newCursorOffset: number) => {
    if (newCursorOffset !== lastCursorOffsetSentRef.current) {
      const action = createAction.updateCursorOffset(newCursorOffset);
      dispatchToServerRef.current(action);
      lastCursorOffsetSentRef.current = newCursorOffset;
    }
  }, []);

  return {
    updateClientState,
    updateCursorOffset,
  };
}
