import fs from 'node:fs/promises';
import { IncomingMessage } from 'node:http';
import path from 'node:path';
import WebSocket, { WebSocketServer } from 'ws';
import { Logger } from '~/platform/api/Logger';
import {
  Action,
  ACTION_REDO,
  ACTION_UNDO,
  ACTION_UPDATE_CODE,
  ACTION_UPDATE_SELECTION,
} from '../interfaces/actions';
import { ClientCursor } from '../interfaces/ClientCursor';
import { Selection } from '../interfaces/Selection';
import { computeHash } from '../utils/computeHash';
import { createSelection } from '../utils/createSelection';
import { applyDiff } from '../utils/diffs';
import { History } from '../utils/History';
import { createAction } from './utils/createAction';
import { ExecQueue } from './utils/ExecQueue';

const CURSOR_COLORS = ['red', 'fuchsia', 'yellow', 'orange', 'aqua', 'green'];
const SHARED_CODE_FILE_PATH = path.join(process.cwd(), '/sharedCode.txt');

export class WSServer {
  private clientID = 0;
  private readonly clients = [] as Client[];
  private code = '';
  private codeHash = computeHash(this.code);
  private readonly codeUpdateQueue = new ExecQueue();
  private readonly history = new History();
  private readonly requestQueue = new ExecQueue();
  private readonly server: WebSocketServer;

  static async create(): Promise<WSServer> {
    const server = new WSServer();
    await server.loadSharedCode();
    return server;
  }

  private static dispatch(wsClient: WebSocket, action: Action): void {
    wsClient.send(JSON.stringify(action));
  }

  private constructor() {
    this.server = new WebSocketServer({ noServer: true });
    this.server.on('connection', this.handleConnection.bind(this));
  }

  handleUpgrade(req: IncomingMessage): void {
    this.server.handleUpgrade(
      req,
      req.socket,
      Buffer.from([]),
      (ws: WebSocket) => this.server.emit('connection', ws, req)
    );
  }

  private dispatchAll(
    action: Action | ((client: Client) => Action | undefined)
  ): void {
    const actionCreator = typeof action === 'function' ? action : () => action;

    this.server.clients.forEach((wsClient) => {
      if (wsClient.readyState === WebSocket.OPEN) {
        const client = this.getClientFromWS(wsClient);
        const clientAction = actionCreator(client);

        if (clientAction !== undefined) {
          WSServer.dispatch(wsClient, actionCreator(client) as Action);
        }
      }
    });
  }

  private fixCursorOffsets(): void {
    const codeLength = this.code.length;

    for (const client of this.clients) {
      if (client.selection[0] > codeLength) {
        this.updateClientSelection(client, createSelection(codeLength));
      }
    }
  }

  private getClientFromWS(wsClient: WebSocket): Client {
    return this.clients.find((client) => client.ws === wsClient) as Client;
  }

  private getCursors(): ClientCursor[] {
    return this.clients.map(({ cursorColor, id, selection }) => ({
      clientID: id,
      color: cursorColor,
      selection,
    }));
  }

  private handleConnection(wsClient: WebSocket): void {
    this.requestQueue.enqueue(() => {
      const id = ++this.clientID;
      const colorsUsed = this.clients.map((c) => c.cursorColor);
      const cursorColor =
        CURSOR_COLORS.find((color) => !colorsUsed.includes(color)) || 'white';

      const client = {
        cursorColor,
        id,
        selection: createSelection(0),
        ws: wsClient,
      };
      this.clients.push(client);

      const state = {
        code: this.code,
        cursorColor,
        id,
      };
      WSServer.dispatch(wsClient, createAction.updateClientState(state));
      this.sendCursors();
    });

    wsClient.on('close', () => {
      const client = this.getClientFromWS(wsClient);
      const clientIndex = this.clients.indexOf(client);
      this.clients.splice(clientIndex, 1);
      this.sendCursors();
    });

    wsClient.on('message', (data) => {
      this.requestQueue.enqueue(() => {
        try {
          const action = JSON.parse(data.toString()) as Action;
          this.reduce(wsClient, action);
        } catch (error: any) {
          Logger.error(error.stack);
        }
      });
    });
  }

  private async loadSharedCode(): Promise<void> {
    try {
      this.code = await fs.readFile(SHARED_CODE_FILE_PATH, 'utf8');
      this.codeHash = computeHash(this.code);
    } catch (error) {
      if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
        return; // File does not exist
      }
      throw error;
    }
  }

  private reduce(wsClient: WebSocket, [type, payload]: Action): void {
    const client = this.getClientFromWS(wsClient);

    switch (type) {
      case ACTION_REDO:
      case ACTION_UNDO: {
        const historyFunction = type === ACTION_UNDO ? 'undo' : 'redo';
        const state = this.history[historyFunction](this.code);

        if (state === undefined) {
          return;
        }
        const { code, selection } = state;

        this.dispatchAll(createAction.updateClientState({ code }));
        this.updateClientSelection(client, selection);
        this.updateCode(code);
        break;
      }

      case ACTION_UPDATE_SELECTION:
        this.updateClientSelection(client, createSelection(payload.s));
        break;

      case ACTION_UPDATE_CODE: {
        const {
          cs: currentSelection,
          d: diffs,
          ns: newSelection,
          sh: safetyHash,
        } = payload;

        if (currentSelection === undefined || newSelection === undefined) {
          return;
        }
        const code = diffs.reduce(applyDiff, this.code);

        if (safetyHash !== this.codeHash) {
          // Requested update is obsolete so we reset client code
          WSServer.dispatch(
            wsClient,
            createAction.updateClientState({ code: this.code })
          );
          return;
        }
        this.dispatchAll(({ id }) =>
          id === client.id
            ? createAction.updateCode(diffs, newSelection)
            : createAction.updateCode(diffs)
        );
        this.updateClientSelection(client, newSelection, true);
        this.history.pushState(
          {
            code: this.code,
            selection: currentSelection,
          },
          {
            code,
            selection: newSelection,
          }
        );
        this.updateCode(code);
        break;
      }

      default:
        throw new Error('Unknown action');
    }
  }

  private sendCursors(): void {
    const cursors = this.getCursors();
    this.dispatchAll((client) =>
      createAction.updateCursors(
        cursors.filter(({ clientID }) => clientID !== client.id)
      )
    );
  }

  private updateCode(code: string): void {
    this.code = code;
    this.codeHash = computeHash(code);
    this.fixCursorOffsets();

    // Avoids race conditions
    this.codeUpdateQueue.enqueue(async () =>
      fs.writeFile(SHARED_CODE_FILE_PATH, code)
    );
  }

  private updateClientSelection(
    client: Client,
    selection: Selection,
    excludeClient = false
  ): void {
    client.selection = selection;
    this.dispatchAll(({ id }) => {
      if (!excludeClient || id !== client.id) {
        return createAction.updateSelection(client.id, selection);
      }
    });
  }
}

export interface Client {
  cursorColor: string;
  id: number;
  selection: Selection;
  ws: WebSocket;
}
