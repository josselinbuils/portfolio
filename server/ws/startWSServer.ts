import fs from 'fs';
import { Action, createStore, Reducer as ReduxReducer } from 'redux';
import { OPEN, Server } from 'ws';
import { Logger } from '../Logger';
import { ClientState } from './ClientState';
import { STATE_PATH } from './constants';
import { ExecQueue } from './ExecQueue';
import { Reducer } from './Reducer';

export async function startWSServer(port: number): Promise<void> {
  Logger.info(`Starts WebSocket server`);

  return new Promise<void>((resolve) => {
    const execQueue = new ExecQueue();
    const reducer = new Reducer();
    const code = fs.existsSync(STATE_PATH)
      ? fs.readFileSync(STATE_PATH, 'utf8')
      : '';
    const store = createStore(reducer.reduce as ReduxReducer, { code });

    const server = new Server({ port }, () => {
      Logger.info(`WebSocket server is listening on port ${port}`);
      resolve();
    });
    let clientID = -1;

    server.on('connection', (ws) => {
      execQueue.enqueue(() => {
        const clientState = {
          clientID: ++clientID,
          code: store.getState().code,
          cursorColor: 'red',
        } as ClientState;

        ws.send(
          JSON.stringify({
            type: 'SET_STATE',
            payload: {
              state: clientState,
            },
          })
        );
      });

      ws.on('message', (message: string) => {
        execQueue.enqueue(() => {
          try {
            dispatch(JSON.parse(message));
          } catch (error) {
            Logger.error(error.stack);
          }
        });
      });
    });

    function dispatch(action: Action): void {
      store.dispatch(action);

      server.clients.forEach((wsClient) => {
        if (wsClient.readyState === OPEN) {
          wsClient.send(JSON.stringify(action));
        }
      });
    }
  });
}

interface ServerState {
  clients: {
    clientID: number;
    cursorColor: string;
    cursorPosition: number;
  }[];
  code: string;
}
