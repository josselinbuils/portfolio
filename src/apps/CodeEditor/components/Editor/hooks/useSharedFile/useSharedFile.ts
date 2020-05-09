import { Deferred } from '@josselinbuils/utils';
import { Reducer, useCallback, useEffect, useReducer, useRef } from 'react';
import { BASE_URL_WS } from '~/platform/constants';
import { useDynamicRef } from '~/platform/hooks/useDynamicRef';
import { useKeyMap } from '~/platform/hooks/useKeyMap';
import { Diff } from '../../interfaces/Diff';
import { Action, actionCreators, actionsHandlers } from './actions';
import { ClientState } from './interfaces/ClientState';
import { applyDiff } from './utils/applyDiff';
import { computeHash } from './utils/computeHash';

const DEBUG = false;
const REOPEN_DELAY_MS = 1000;
const WS_URL = `${BASE_URL_WS}/portfolio-react`;

const initialState = {
  id: -1,
  code: '',
  cursorColor: '#f0f0f0',
  cursorOffset: 0,
  cursors: [],
} as ClientState;

const reducer = ((clientState, action) =>
  actionsHandlers[action.type]?.(clientState, action) ||
  clientState) as Reducer<ClientState, Action>;

export function useSharedFile({
  active,
  applyClientState,
  cursorOffset,
}: {
  active: boolean;
  cursorOffset: number;
  applyClientState(clientState: ClientState): any;
}): {
  updateClientState(diffObj: Diff, cursorOffset: number): void;
  updateCursorOffset(cursorOffset: number): void;
} {
  const dispatchToServerRef = useRef<(action: Action) => void>(() => {});
  const [clientState, dispatch] = useReducer(reducer, initialState);
  const applyClientStateRef = useDynamicRef(applyClientState);
  const codeRef = useRef(clientState.code);
  const cursorOffsetRef = useDynamicRef(cursorOffset);
  const lastCursorOffsetSentRef = useRef(0);
  const hashToWaitForRef = useRef<number>();
  const diffQueueRef = useRef<PartialDiff[]>([]);

  useKeyMap(
    {
      'Control+Z,Meta+Z': () =>
        dispatchToServerRef.current(actionCreators.undo()),
      'Control+Shift+Z,Meta+Shift+Z': () =>
        dispatchToServerRef.current(actionCreators.redo()),
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
          actionCreators.updateCursorOffset(cursorOffsetRef.current)
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
      dispatch(actionCreators.setSharedState(initialState));
    };
  }, [active, cursorOffsetRef]);

  useEffect(() => {
    if (clientState === undefined) {
      return;
    }
    applyClientStateRef.current(clientState);

    const previousCode = codeRef.current;
    codeRef.current = clientState.code;
    const currentHash = computeHash(clientState.code);

    if (diffQueueRef.current.length > 0) {
      if (currentHash !== hashToWaitForRef.current) {
        if (clientState.code !== codeRef.current) {
          // We received a non expected state. As the server is always right,
          // we have to deal with it
          diffQueueRef.current.length = 0;
          hashToWaitForRef.current = currentHash;

          if (DEBUG) {
            console.error('empty queue');
          }
          return;
        }
        // We received a state update without code change
        if (DEBUG) {
          console.log('wait before sending', diffQueueRef.current[0]);
        }
        return;
      }
      const { diff, type } = diffQueueRef.current.shift() as PartialDiff;

      if (DEBUG) {
        console.log('dequeue', { diff, type }, currentHash, clientState.code);
      }
      const startOffset = clientState.cursorOffset;
      const endOffset = startOffset + diff.length * (type === '+' ? 1 : -1);
      const diffObj = { diff, endOffset, startOffset, type } as Diff;
      const action = actionCreators.updateClientState(
        diffObj,
        endOffset,
        currentHash
      );
      const newCode = applyDiff(clientState.code, diffObj);
      dispatchToServerRef.current(action);
      lastCursorOffsetSentRef.current = endOffset;
      hashToWaitForRef.current = computeHash(newCode);
    } else if (
      hashToWaitForRef.current === undefined ||
      clientState.code !== previousCode
    ) {
      if (DEBUG) {
        console.log(`reset hashToWaitFor to ${currentHash}`);
      }
      hashToWaitForRef.current = currentHash;
    }
  }, [applyClientStateRef, clientState, codeRef]);

  const updateClientState = useCallback(
    (diffObj: Diff, newCursorOffset: number) => {
      const currentHash = computeHash(codeRef.current);
      const diffQueue = diffQueueRef.current;

      if (DEBUG) {
        console.log(`compare ${currentHash} and ${hashToWaitForRef.current}`);
      }

      if (currentHash === hashToWaitForRef.current && diffQueue.length === 0) {
        const action = actionCreators.updateClientState(
          diffObj,
          newCursorOffset,
          currentHash
        );
        const newCode = applyDiff(codeRef.current, diffObj);

        if (DEBUG) {
          console.log('send directly', diffObj.diff);
        }
        hashToWaitForRef.current = computeHash(newCode);
        lastCursorOffsetSentRef.current = newCursorOffset;
        dispatchToServerRef.current(action);
      } else {
        const { diff, type } = diffObj;

        if (DEBUG) {
          console.log('enqueue', { diff, type });
        }
        diffQueue.push({ diff, type });
      }
    },
    [codeRef]
  );

  const updateCursorOffset = useCallback((newCursorOffset: number) => {
    if (newCursorOffset !== lastCursorOffsetSentRef.current) {
      const action = actionCreators.updateCursorOffset(newCursorOffset);
      dispatchToServerRef.current(action);
      lastCursorOffsetSentRef.current = newCursorOffset;
    }
  }, []);

  return {
    updateClientState,
    updateCursorOffset,
  };
}

type PartialDiff = Pick<Diff, 'diff' | 'type'>;
