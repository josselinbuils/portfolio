import { Deferred } from '@josselinbuils/utils/Deferred';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import type { Action } from '~/platform/state/interfaces/Action';

const REOPEN_DELAY_MS = 1000;
const WS_API_PATHNAME = '/api/CodeEditor/ws';

const clients: number[] = [];
let wsConnectedDeferred = new Deferred<void>();
let clientId = -1;
let maintainOpen = true;
let reopenTimeoutID: number | undefined;
let ws: WebSocket | undefined;
let wsReadyPromise: Promise<unknown>;

export function useSharedState({
  active,
  dispatchToClient,
}: {
  active: boolean;
  dispatchToClient(action: Action<any>): void;
}): {
  dispatchToServer(action: Action<any>): void;
} {
  const id = useMemo(() => ++clientId, []);
  const dispatchToServerRef = useRef<(action: Action) => void | Promise<void>>(
    () => {}
  );

  useEffect(() => {
    if (!active) {
      return;
    }

    clients.push(id);
    maintainOpen = true;

    dispatchToServerRef.current = async (action: Action<any>) => {
      await wsConnectedDeferred.promise;
      ws?.send(JSON.stringify(action));
    };

    if (wsReadyPromise === undefined) {
      wsReadyPromise = fetch(WS_API_PATHNAME);
    }
    openSocket();

    async function openSocket(): Promise<void> {
      await wsReadyPromise;

      const isOpen =
        ws !== undefined && [ws.CONNECTING, ws.OPEN].includes(ws.readyState);

      if (!maintainOpen || isOpen) {
        return;
      }

      const { host, protocol } = window.location;
      const wsProtocol = protocol === 'https:' ? `wss:` : `ws:`;

      ws = new WebSocket(`${wsProtocol}//${host}${WS_API_PATHNAME}`);

      ws.onclose = () => {
        wsConnectedDeferred = new Deferred<void>();

        if (maintainOpen) {
          reopenTimeoutID = window.setTimeout(openSocket, REOPEN_DELAY_MS);
        }
      };
      ws.onopen = () => {
        wsConnectedDeferred.resolve();
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
      clients.splice(clients.indexOf(id), 1);

      if (clients.length === 0) {
        maintainOpen = false;
        clearTimeout(reopenTimeoutID);
        dispatchToServerRef.current = () => {};
        ws?.close();
        ws = undefined;
      }
    };
  }, [active, dispatchToClient, id]);

  const dispatchToServer = useCallback((action: Action) => {
    dispatchToServerRef.current(action);
  }, []);

  return { dispatchToServer };
}
