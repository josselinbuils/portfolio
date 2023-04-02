import { Deferred } from '@josselinbuils/utils/Deferred';
import type { Action } from '~/platform/state/interfaces/Action';

const REOPEN_DELAY_MS = 1000;
const WS_API_PATHNAME = '/api/CodeEditor/ws';

const clients: { dispatch(action: Action<any>): void; id: number }[] = [];
let wsConnectedDeferred = new Deferred<void>();
let clientId = -1;
let reopenTimeoutID: number | undefined;
let ws: WebSocket | undefined;
let wsReadyPromise: Promise<unknown>;

export async function dispatchToServer(action: Action<any>) {
  await wsConnectedDeferred.promise;
  ws?.send(JSON.stringify(action));
}

export function registerClient(
  dispatch: (action: Action<any>) => void
): () => void {
  const id = ++clientId;

  clients.push({ dispatch, id });
  openSocket();

  return () => unregisterClient(id);
}

async function openSocket(): Promise<void> {
  console.log('openSocket');
  if (wsReadyPromise === undefined) {
    wsReadyPromise = fetch(WS_API_PATHNAME);
  }
  await wsReadyPromise;

  const isAlreadyOpen =
    ws !== undefined && [ws.CONNECTING, ws.OPEN].includes(ws.readyState as any);

  if (isAlreadyOpen || clients.length === 0) {
    return;
  }

  const { host, protocol } = window.location;
  const wsProtocol = protocol === 'https:' ? `wss:` : `ws:`;

  ws = new WebSocket(`${wsProtocol}//${host}${WS_API_PATHNAME}`);

  ws.onclose = () => {
    wsConnectedDeferred = new Deferred<void>();

    if (clients.length > 0) {
      console.log('reopen');
      reopenTimeoutID = window.setTimeout(openSocket, REOPEN_DELAY_MS);
    }
  };
  ws.onopen = () => {
    wsConnectedDeferred.resolve();
  };
  ws.onmessage = (event) => {
    try {
      const action = JSON.parse(event.data) as Action;
      clients.forEach(({ dispatch }) => dispatch(action));
    } catch (error) {
      console.error(error);
    }
  };
}

function unregisterClient(id: number): void {
  clients.splice(
    clients.findIndex((client) => client.id === id),
    1
  );
  if (clients.length === 0) {
    clearTimeout(reopenTimeoutID);
    ws?.close();
    ws = undefined;
  }
}
