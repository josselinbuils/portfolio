import fs from 'fs';
import WebSocket, { OPEN, Server } from 'ws';
import { Logger } from '../Logger';
import { STATE_PATH } from './constants';
import { ExecQueue } from './ExecQueue';
import { ClientCursor, ClientState } from './interfaces';
import { spliceString } from './spliceString';

const ACTION_SET_SHARED_STATE = 'SET_SHARED_STATE';
const ACTION_UPDATE_CURSOR_OFFSET = 'UPDATE_CURSOR_OFFSET';
const ACTION_UPDATE_CURSORS = 'UPDATE_CURSORS';
const ACTION_UPDATE_SHARED_STATE = 'UPDATE_SHARED_STATE';
const CURSOR_COLORS = ['red', 'fuchsia', 'yellow', 'orange', 'aqua', 'green'];

export class WSServer {
  private clientID = 0;
  private readonly clients = [] as Client[];
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

  private dispatch(action: Action): void {
    this.server.clients.forEach((wsClient) => {
      if (wsClient.readyState === OPEN) {
        wsClient.send(JSON.stringify(action));
      }
    });
  }

  private fixCursorOffsets(): void {
    const codeLength = this.code.length;

    for (const client of this.clients) {
      if (client.cursorOffset > codeLength) {
        client.cursorOffset = codeLength;
      }
    }
  }

  private getClientFromWS(ws: WebSocket): Client {
    return this.clients.find((client) => client.ws === ws);
  }

  private getCursors(): ClientCursor[] {
    return this.clients.map(({ clientID, cursorColor, cursorOffset }) => ({
      clientID,
      color: cursorColor,
      offset: cursorOffset,
    }));
  }

  private handleConnection(ws: WebSocket): void {
    this.requestQueue.enqueue(() => {
      const clientID = ++this.clientID;
      const colorsUsed = this.clients.map((c) => c.cursorColor);
      const cursorColor =
        CURSOR_COLORS.find((color) => !colorsUsed.includes(color)) || 'white';

      const client = {
        clientID,
        cursorColor,
        cursorOffset: 0,
        ws,
      };
      this.clients.push(client);

      ws.send(
        JSON.stringify({
          type: ACTION_SET_SHARED_STATE,
          payload: {
            state: {
              clientID,
              code: this.code,
              cursorColor,
              cursors: this.getCursors(),
            },
          },
        } as SetSharedStateAction)
      );
    });

    ws.on('close', () => {
      const client = this.getClientFromWS(ws);
      const clientIndex = this.clients.indexOf(client);
      this.clients.splice(clientIndex, 1);
      this.sendCursors();
    });

    ws.on('message', (message: string) => {
      this.requestQueue.enqueue(() => {
        try {
          const action = JSON.parse(message) as Action;
          const client = this.getClientFromWS(ws);
          this.reduce(client, action);
        } catch (error) {
          Logger.error(error.stack);
        }
      });
    });
  }

  private reduce(client: Client, action: Action): void {
    if (action.type === ACTION_UPDATE_CURSOR_OFFSET) {
      client.cursorOffset = action.payload.cursorOffset;
      this.sendCursors();
    } else if (action.type === ACTION_UPDATE_SHARED_STATE) {
      const { cursorOffset, diffObj } = action.payload;

      client.cursorOffset = cursorOffset;

      this.updateCode(
        diffObj.type === '+'
          ? spliceString(this.code, diffObj.startOffset, 0, diffObj.diff)
          : spliceString(this.code, diffObj.endOffset, diffObj.diff.length)
      );
      this.dispatch(action);
      this.fixCursorOffsets();
      this.sendCursors();
    }
  }

  private sendCursors(): void {
    this.dispatch({
      type: ACTION_UPDATE_CURSORS,
      payload: {
        cursors: this.getCursors(),
      },
    });
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

export type Action =
  | SetSharedStateAction
  | UpdateCursorOffsetAction
  | UpdateCursorsAction
  | UpdateSharedStateAction;

interface Client {
  clientID: number;
  cursorColor: string;
  cursorOffset: number;
  ws: WebSocket;
}

interface Diff {
  endOffset: number;
  diff: string;
  startOffset: number;
  type: '+' | '-';
}

interface SetSharedStateAction {
  type: typeof ACTION_SET_SHARED_STATE;
  payload: { state: ClientState };
}

interface UpdateCursorOffsetAction {
  type: typeof ACTION_UPDATE_CURSOR_OFFSET;
  payload: {
    cursorOffset: number;
  };
}

interface UpdateCursorsAction {
  type: typeof ACTION_UPDATE_CURSORS;
  payload: {
    cursors: ClientCursor[];
  };
}

interface UpdateSharedStateAction {
  type: typeof ACTION_UPDATE_SHARED_STATE;
  payload: {
    cursorOffset: number;
    diffObj: Diff;
  };
}
