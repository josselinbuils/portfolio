import { Deferred } from '@josselinbuils/utils';
import { Reducer, useCallback, useEffect, useReducer, useRef } from 'react';
import { BASE_URL_WS } from '~/platform/constants';
import { useDynamicRef } from '~/platform/hooks/useDynamicRef';
import { useKeyMap } from '~/platform/hooks/useKeyMap';
import { EditableState } from '../../interfaces/EditableState';
import { applyDiff, Diff, getCursorOffsetAfterDiff } from '../../utils/diffs';
import { Action, createAction, handleAction } from './actions';
import { ClientState } from './ClientState';
import { computeHash } from './computeHash';

const DEBUG = false;
const REOPEN_DELAY_MS = 1000;
const WS_URL = `${BASE_URL_WS}/portfolio-react`;

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
  applyClientState,
  cursorOffset,
}: {
  active: boolean;
  cursorOffset: number;
  applyClientState(clientState: ClientState): any;
}): {
  updateCode(code: string | Diff, cursorOffset: number): void;
  updateCursorOffset(cursorOffset: number): void;
} {
  const dispatchToServerRef = useRef<(action: Action) => void>(() => {});
  const [clientState, dispatch] = useReducer(reducer, initialState);
  const applyClientStateRef = useDynamicRef(applyClientState);
  const codeRef = useRef(clientState.code);
  const cursorOffsetRef = useDynamicRef(cursorOffset);
  const lastCursorOffsetSentRef = useRef(0);
  const hashToWaitForRef = useRef<number>();
  const updateQueueRef = useRef<Update[]>([]);

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

    const previousCode = codeRef.current;
    codeRef.current = clientState.code;
    const currentHash = computeHash(clientState.code);

    if (updateQueueRef.current.length > 0) {
      if (currentHash !== hashToWaitForRef.current) {
        if (clientState.code !== codeRef.current) {
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
      const update = updateQueueRef.current.shift() as Update;
      let action: Action;
      let newCode: string;
      let newCursorOffset: number;

      if (DEBUG) {
        console.debug('dequeue', update, currentHash, clientState.code);
      }

      if ((update as EditableState).code !== undefined) {
        newCode = (update as EditableState).code;
        newCursorOffset = (update as EditableState).cursorOffset;
        action = createAction.updateCode(newCode, newCursorOffset, currentHash);
      } else {
        const diff = update as Diff;
        diff[1] = clientState.cursorOffset;

        const endOffset = getCursorOffsetAfterDiff(diff);
        action = createAction.updateCode(diff, endOffset, currentHash);
        newCode = applyDiff(clientState.code, diff);
        newCursorOffset = endOffset;
      }
      dispatchToServerRef.current(action);
      lastCursorOffsetSentRef.current = newCursorOffset;
      hashToWaitForRef.current = computeHash(newCode);
    } else if (
      hashToWaitForRef.current === undefined ||
      clientState.code !== previousCode
    ) {
      if (DEBUG) {
        console.debug(`reset hashToWaitFor to ${currentHash}`);
      }
      hashToWaitForRef.current = currentHash;
    }
  }, [active, applyClientStateRef, clientState, codeRef]);

  const updateCode = useCallback(
    (code: string | Diff, newCursorOffset: number) => {
      if (!active) {
        return;
      }
      const currentHash = computeHash(codeRef.current);
      const updateQueue = updateQueueRef.current;

      if (DEBUG) {
        console.debug('updateCode()', code, newCursorOffset);
      }

      if (
        currentHash === hashToWaitForRef.current &&
        updateQueue.length === 0
      ) {
        const action = createAction.updateCode(
          code,
          newCursorOffset,
          currentHash
        );
        const newCode =
          typeof code === 'string' ? code : applyDiff(codeRef.current, code);

        if (DEBUG) {
          console.debug('send directly', code);
        }
        hashToWaitForRef.current = computeHash(newCode);
        lastCursorOffsetSentRef.current = newCursorOffset;
        dispatchToServerRef.current(action);
      } else {
        const update =
          typeof code === 'string'
            ? { code, cursorOffset: newCursorOffset }
            : code;

        if (DEBUG) {
          console.debug('enqueue', update);
        }
        updateQueue.push(update);
      }
    },
    [active]
  );

  const updateCursorOffset = useCallback((newCursorOffset: number) => {
    if (newCursorOffset !== lastCursorOffsetSentRef.current) {
      const action = createAction.updateCursorOffset(newCursorOffset);
      dispatchToServerRef.current(action);
      lastCursorOffsetSentRef.current = newCursorOffset;
    }
  }, []);

  return {
    updateCode,
    updateCursorOffset,
  };
}

type Update = EditableState | Diff;
