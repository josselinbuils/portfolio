import { Deferred } from '@josselinbuils/utils';
import {
  Reducer,
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { BASE_URL_WS } from '~/platform/constants';
import { useDynamicRef } from '~/platform/hooks';
import { EditableState } from '../../interfaces';
import { getDiff } from '../../utils';
import { Action, actionCreators, actionsHandlers } from './actions';
import { ClientState } from './interfaces';

const SAFE_UPDATE_DELAY_MS = 500;
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
}: {
  active: boolean;
  code: string;
  applyClientState(clientState: ClientState): any;
}): {
  updateClientState(newState: EditableState): void;
  updateCursorOffset(cursorOffset: number): void;
} {
  const [dispatchToServer, setDispatchToServer] = useState<
    (action: Action) => void
  >(() => {});
  const [clientState, dispatch] = useReducer(reducer, initialState);
  const applyClientStateRef = useDynamicRef(applyClientState);
  const codeRef = useDynamicRef(code);
  const lastLocalChangeTime = useRef(0);
  const lastCursorOffsetSentRef = useRef(0);

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

      setDispatchToServer(() => async (action: Action) => {
        await readyDeferred.promise;
        ws.send(JSON.stringify(action));
      });
    }
    openSocket();

    return () => {
      maintainOpen = false;
      setDispatchToServer(() => {});
      ws.close();
      dispatch(actionCreators.setSharedState(initialState));
    };
  }, [active]);

  useEffect(() => {
    if (clientState === undefined) {
      return;
    }
    const targetTime = lastLocalChangeTime.current + SAFE_UPDATE_DELAY_MS;
    const delay = Math.max(targetTime - performance.now(), 0);
    const apply = () => applyClientStateRef.current(clientState);

    if (delay === 0) {
      apply();
    } else {
      const timeoutId = setTimeout(() => {
        applyClientStateRef.current(clientState);
      }, delay);

      return () => clearTimeout(timeoutId);
    }
  }, [applyClientStateRef, clientState]);

  const updateClientState = useCallback(
    (newState: EditableState) => {
      const action = actionCreators.updateClientState(
        getDiff(codeRef.current, newState.code),
        newState.cursorOffset
      );
      dispatchToServer(action);
      lastLocalChangeTime.current = performance.now();
      lastCursorOffsetSentRef.current = newState.cursorOffset;
    },
    [codeRef, dispatchToServer]
  );

  const updateCursorOffset = useCallback(
    (cursorOffset: number) => {
      if (cursorOffset !== lastCursorOffsetSentRef.current) {
        const action = actionCreators.updateCursorOffset(cursorOffset);
        dispatchToServer(action);
        lastCursorOffsetSentRef.current = cursorOffset;
      }
    },
    [dispatchToServer]
  );

  return {
    updateClientState,
    updateCursorOffset,
  };
}
