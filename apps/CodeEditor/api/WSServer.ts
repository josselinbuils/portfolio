import fs from 'fs';
import { IncomingMessage } from 'http';
import WebSocket, { OPEN, Server } from 'ws';
import { Logger } from '~/platform/api/Logger';
import { History } from '../components/Editor/hooks/useHistory/History';
import {
  Action,
  ACTION_REDO,
  ACTION_UNDO,
  ACTION_UPDATE_CODE,
  ACTION_UPDATE_SELECTION,
} from '../components/Editor/hooks/useSharedFile/interfaces/actions';
import { ClientCursor } from '../components/Editor/hooks/useSharedFile/interfaces/ClientCursor';
import { computeHash } from '../components/Editor/hooks/useSharedFile/utils/computeHash';
import { Selection } from '../components/Editor/interfaces/Selection';
import { applyDiff } from '../components/Editor/utils/diffs';
import { STATE_PATH } from './constants';
import { createAction } from './utils/createAction';
import { ExecQueue } from './utils/ExecQueue';

const CURSOR_COLORS = ['red', 'fuchsia', 'yellow', 'orange', 'aqua', 'green'];

export class WSServer {
  private clientID = 0;
  private readonly clients = [] as Client[];
  private code = fs.existsSync(STATE_PATH)
    ? fs.readFileSync(STATE_PATH, 'utf8')
    : '';
  private codeHash = computeHash(this.code);
  private readonly codeUpdateQueue = new ExecQueue();
  private readonly history = new History();
  private readonly requestQueue = new ExecQueue();
  private readonly server: Server;

  static create(): WSServer {
    return new WSServer();
  }

  private static dispatch(wsClient: WebSocket, action: Action): void {
    wsClient.send(JSON.stringify(action));
  }

  private constructor() {
    this.server = new Server({ noServer: true });
    this.server.on('connection', this.handleConnection.bind(this));
  }

  handleUpgrade(req: IncomingMessage): void {
    this.server.handleUpgrade(
      req,
      req.socket,
      new Buffer([]),
      (ws: WebSocket) => this.server.emit('connection', ws, req)
    );
  }

  private dispatchAll(
    action: Action | ((client: Client) => Action | undefined)
  ): void {
    const actionCreator = typeof action === 'function' ? action : () => action;

    this.server.clients.forEach((wsClient) => {
      if (wsClient.readyState === OPEN) {
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
      if (client.selection.start > codeLength) {
        this.updateClientSelection(client, {
          end: codeLength,
          start: codeLength,
        });
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
      offset: selection.start,
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
        selection: { end: 0, start: 0 },
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

    wsClient.on('message', (message: string) => {
      this.requestQueue.enqueue(() => {
        try {
          const action = JSON.parse(message) as Action;
          this.reduce(wsClient, action);
        } catch (error) {
          Logger.error(error.stack);
        }
      });
    });
  }

  private reduce(wsClient: WebSocket, action: Action): void {
    const client = this.getClientFromWS(wsClient);

    switch (action.type) {
      case ACTION_REDO:
      case ACTION_UNDO: {
        const historyFunction = action.type === ACTION_UNDO ? 'undo' : 'redo';
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
        this.updateClientSelection(client, action.payload.selection);
        break;

      case ACTION_UPDATE_CODE: {
        const { diffs, safetyHash, selection } = action.payload;

        if (selection === undefined) {
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
            ? createAction.updateCode(diffs, selection)
            : createAction.updateCode(diffs)
        );
        this.updateClientSelection(client, selection, true);
        this.history.pushState(this.code, { code, selection });
        this.updateCode(code);
      }
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
    this.codeUpdateQueue.enqueue(
      async () =>
        new Promise<void>((resolve) => {
          fs.writeFile(STATE_PATH, code, resolve as () => void);
        })
    );
  }

  private updateClientSelection(
    client: Client,
    selection: Selection,
    excludeClient: boolean = false
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
