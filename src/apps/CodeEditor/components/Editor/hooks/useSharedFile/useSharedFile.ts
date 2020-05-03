import { Deferred } from '@josselinbuils/utils';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Action, createStore, Reducer } from 'redux';
import { BASE_URL_WS } from '~/platform/constants';
import { useDynamicRef } from '~/platform/hooks';
import { EditableState } from '../../interfaces';
import { getDiff } from '../../utils';
import { actionCreators, actionsHandlers } from './actions';
import { ClientState } from './ClientState';

const SAFE_UPDATE_DELAY_MS = 500;
const WS_URL = `${BASE_URL_WS}/portfolio-react`;

const reducer = ((clientState: ClientState, action: Action) =>
  actionsHandlers[action.type]?.(clientState, action) ||
  clientState) as Reducer<ClientState>;

export function useSharedFile({
  active,
  applyClientState,
  code,
}: {
  active: boolean;
  code: string;
  applyClientState(clientState: ClientState): any;
}): { updateClientState(newState: EditableState): void } {
  const [dispatchToServer, setDispatchToServer] = useState<
    (action: Action) => void
  >(() => {});
  const [clientState, setClientState] = useState<ClientState>();
  const applyClientStateRef = useDynamicRef(applyClientState);
  const codeRef = useDynamicRef(code);
  const lastLocalChangeTime = useRef(0);

  useEffect(() => {
    if (!active) {
      return;
    }
    const store = createStore(reducer);
    const ws = new WebSocket(WS_URL);
    const readyDeferred = new Deferred<void>();

    ws.onmessage = (event) => {
      try {
        const action = JSON.parse(event.data) as Action;
        store.dispatch(action);
      } catch (error) {
        console.error(error);
      }
    };

    ws.onopen = () => {
      readyDeferred.resolve();
    };

    store.subscribe(() => {
      setClientState(store.getState());
    });

    setDispatchToServer(() => async (action: Action) => {
      await readyDeferred.promise;
      ws.send(JSON.stringify(action));
    });

    return () => {
      setDispatchToServer(() => {});
      ws.close();
    };
  }, [active]);

  useEffect(() => {
    if (!active || clientState === undefined) {
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
  }, [active, applyClientStateRef, clientState]);

  const updateClientState = useCallback(
    (newState: EditableState) => {
      if (active) {
        const action = actionCreators.updateClientState(
          getDiff(codeRef.current, newState.code),
          newState.cursorOffset
        );
        dispatchToServer(action);
        lastLocalChangeTime.current = performance.now();
      }
    },
    [active, codeRef, dispatchToServer]
  );

  return { updateClientState };
}
