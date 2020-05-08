import { Deferred } from '@josselinbuils/utils';
import { Reducer, useCallback, useEffect, useReducer, useRef } from 'react';
import { BASE_URL_WS } from '~/platform/constants';
import { useDynamicRef } from '~/platform/hooks';
import { Diff, EditableState } from '../../interfaces';
import { getDiff } from '../../utils';
import { Action, actionCreators, actionsHandlers } from './actions';
import { ClientState } from './interfaces';
import { applyDiff, computeHash } from './utils';

const WS_URL = `${BASE_URL_WS}/portfolio-react`;

const initialState = {
  clientID: -1,
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
  code,
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
  const codeRef = useDynamicRef(code);
  const cursorOffsetRef = useDynamicRef(cursorOffset);
  const lastCursorOffsetSentRef = useRef(0);
  const hashToWaitForRef = useRef<number>();
  const diffQueueRef = useRef<PartialDiff[]>([]);

  useEffect(() => {
    if (!active) {
      return;
    }
    let maintainOpen = true;
    let ws: WebSocket;

    function openSocket(): void {
      ws = new WebSocket(WS_URL);
      const readyDeferred = new Deferred<void>();

      ws.onclose = () => {
        if (maintainOpen) {
          openSocket();
        }
      };
      ws.onopen = () => readyDeferred.resolve();
      ws.onmessage = (event) => {
        try {
          const action = JSON.parse(event.data) as Action;
          dispatch(action);
        } catch (error) {
          console.error(error);
        }
      };

      dispatchToServerRef.current = async (action: Action) => {
        await readyDeferred.promise;
        ws.send(JSON.stringify(action));
      };
    }
    openSocket();

    return () => {
      maintainOpen = false;
      dispatchToServerRef.current = () => {};
      ws.close();
      dispatch(actionCreators.setSharedState(initialState));
    };
  }, [active]);

  useEffect(() => {
    if (clientState === undefined) {
      return;
    }
    applyClientStateRef.current(clientState);

    const currentHash = computeHash(clientState.code);

    if (diffQueueRef.current.length > 0) {
      const { diff, type } = diffQueueRef.current.shift() as PartialDiff;
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
    } else {
      hashToWaitForRef.current = currentHash;
    }
  }, [applyClientStateRef, clientState, codeRef, cursorOffsetRef]);

  const updateClientState = useCallback(
    (newState: EditableState) => {
      const currentState = {
        code: codeRef.current,
        cursorOffset: cursorOffsetRef.current,
      };
      const currentHash = computeHash(currentState.code);
      const diffObj = getDiff(currentState.code, newState.code);

      if (
        currentHash === hashToWaitForRef.current &&
        diffQueueRef.current.length === 0
      ) {
        const action = actionCreators.updateClientState(
          diffObj,
          newState.cursorOffset,
          currentHash
        );
        hashToWaitForRef.current = computeHash(newState.code);
        lastCursorOffsetSentRef.current = newState.cursorOffset;
        dispatchToServerRef.current(action);
      } else {
        const { diff, type } = diffObj;
        diffQueueRef.current.push({ diff, type });
      }
    },
    [cursorOffsetRef, codeRef]
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
