import { Deferred } from '@josselinbuils/utils/Deferred';
import { useCallback, useEffect, useRef } from 'react';
import { Action } from '~/platform/state/interfaces/Action';
import { useDynamicRef } from '@josselinbuils/hooks/useDynamicRef';

const REOPEN_DELAY_MS = 1000;
const WS_API_PATHNAME = '/api/CodeEditor/ws';

let maintainOpen = true;
let reopenTimeoutID: number | undefined;
let ws: WebSocket | undefined;
let wsReadyPromise: Promise<unknown>;

export function useSharedState({
  active,
  dispatchToClient,
  onWebsocketClose,
  onWebsocketOpen,
}: {
  active: boolean;
  dispatchToClient(action: Action<any>): void;
  onWebsocketClose?(): unknown;
  onWebsocketOpen?(): unknown;
}): {
  dispatchToServer(action: Action<any>): void;
} {
  const onWebsocketCloseRef = useDynamicRef(onWebsocketClose);
  const onWebsocketOpenRef = useDynamicRef(onWebsocketOpen);
  const dispatchToServerRef = useRef<(action: Action) => void | Promise<void>>(
    () => {}
  );

  useEffect(() => {
    if (!active) {
      return;
    }

    maintainOpen = true;

    if (wsReadyPromise === undefined) {
      wsReadyPromise = fetch(WS_API_PATHNAME);
      openSocket();
    }

    async function openSocket(): Promise<void> {
      await wsReadyPromise;

      const isOpen =
        ws !== undefined && [ws.CONNECTING, ws.OPEN].includes(ws.readyState);

      if (!maintainOpen || isOpen) {
        return;
      }

      const { host, protocol } = window.location;
      const wsProtocol = protocol === 'https:' ? `wss:` : `ws:`;
      const readyDeferred = new Deferred<void>();

      ws = new WebSocket(`${wsProtocol}//${host}${WS_API_PATHNAME}`);

      dispatchToServerRef.current = async (action: Action<any>) => {
        await readyDeferred.promise;
        ws?.send(JSON.stringify(action));
      };

      ws.onclose = () => {
        if (maintainOpen) {
          reopenTimeoutID = window.setTimeout(openSocket, REOPEN_DELAY_MS);
        }
        onWebsocketCloseRef.current?.();
      };
      ws.onopen = () => {
        readyDeferred.resolve();
        onWebsocketOpenRef.current?.();
      };
      ws.onmessage = (event) => {
        try {
          const action = JSON.parse(event.data) as Action;
          dispatchToClient(action);
        } catch (error) {
          console.error(error);
        }
      };
    }

    return () => {
      maintainOpen = false;
      clearTimeout(reopenTimeoutID);
      dispatchToServerRef.current = () => {};
      ws?.close();
      ws = undefined;
    };
  }, [active, dispatchToClient, onWebsocketCloseRef, onWebsocketOpenRef]);

  const dispatchToServer = useCallback((action: Action) => {
    dispatchToServerRef.current(action);
  }, []);

  return { dispatchToServer };
}
