import fs from 'fs';
import WebSocket, { OPEN, Server } from 'ws';
import { Logger } from '../Logger';
import { ClientState } from './ClientState';
import { STATE_PATH } from './constants';
import { ExecQueue } from './ExecQueue';
import { spliceString } from './spliceString';

const ACTION_UPDATE_SHARED_STATE = 'UPDATE_SHARED_STATE';

export class WSServer {
  private clientID = 0;
  private code = fs.existsSync(STATE_PATH)
    ? fs.readFileSync(STATE_PATH, 'utf8')
    : '';
  private readonly codeUpdateQueue = new ExecQueue();
  private readonly requestQueue = new ExecQueue();
  private readonly server: Server;

  static create(port: number, listeningCallback: () => any): WSServer {
    return new WSServer(port, listeningCallback);
  }

  private constructor(port: number, listeningCallback: () => any) {
    this.server = new Server({ port }, listeningCallback);
    this.server.on('connection', this.handleConnection.bind(this));
  }

  private dispatch(action: any): void {
    this.reduce(action);

    this.server.clients.forEach((wsClient) => {
      if (wsClient.readyState === OPEN) {
        wsClient.send(JSON.stringify(action));
      }
    });
  }

  private handleConnection(ws: WebSocket): void {
    this.requestQueue.enqueue(() => {
      const clientState = {
        clientID: ++this.clientID,
        code: this.code,
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
      this.requestQueue.enqueue(() => {
        try {
          this.dispatch(JSON.parse(message));
        } catch (error) {
          Logger.error(error.stack);
        }
      });
    });
  }

  private reduce(action: any): void {
    if (action.type === ACTION_UPDATE_SHARED_STATE) {
      const { diffObj } = (action as UpdateSharedStateAction).payload;

      this.updateCode(
        diffObj.type === '+'
          ? spliceString(this.code, diffObj.startOffset, 0, diffObj.diff)
          : spliceString(this.code, diffObj.endOffset, diffObj.diff.length)
      );
    }
  }

  private updateCode(code: string): void {
    this.code = code;

    // Avoids race conditions
    this.codeUpdateQueue.enqueue(
      async () =>
        new Promise<void>((resolve) => {
          fs.writeFile(STATE_PATH, code, resolve as () => void);
        })
    );
  }
}

interface Diff {
  endOffset: number;
  diff: string;
  startOffset: number;
  type: '+' | '-';
}

interface UpdateSharedStateAction {
  payload: {
    cursorOffset: number;
    diffObj: Diff;
  };
}
