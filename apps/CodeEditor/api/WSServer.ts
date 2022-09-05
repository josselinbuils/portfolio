import fs from 'node:fs/promises';
import { IncomingMessage } from 'node:http';
import path from 'node:path';
import WebSocket, { WebSocketServer } from 'ws';
import * as clientActions from '~/apps/CodeEditor/components/Editor/hooks/useSharedFile/clientActions';
import { fileSaver } from '~/apps/CodeEditor/components/Editor/utils/fileSaver';
import { minifySelection } from '~/apps/CodeEditor/utils/minifySelection';
import { Logger } from '~/platform/api/Logger';
import { Action } from '~/platform/state/interfaces/Action';
import { ActionFromFactory } from '~/platform/state/interfaces/ActionFactory';
import { computeHash } from '~/platform/utils/computeHash';
import { ClientCursor } from '../interfaces/ClientCursor';
import { Selection } from '../interfaces/Selection';
import { createSelection } from '../utils/createSelection';
import { applyDiff } from '../utils/diffs';
import { History, HistoryState } from '../utils/History';
import { ExecQueue } from './utils/ExecQueue';
import * as serverActions from './utils/serverActions';

const CURSOR_COLORS = ['red', 'fuchsia', 'yellow', 'orange', 'aqua', 'green'];
const PERSISTENT_STATE_FILE_PATH = path.join(
  process.cwd(),
  '/persistentState.json'
);

export interface Client {
  cursorColor: string;
  id: number;
  selection: Selection;
  ws: WebSocket;
}

interface FileState {
  clients: Client[];
  code: string;
  codeHash: string;
  history: History;
}

interface PersistentState {
  [filename: string]: {
    code: string;
    historyState: HistoryState;
  };
}

export class WSServer {
  private clientID = 0;
  private readonly files: { [filename: string]: FileState };
  private readonly fsUpdateQueue = new ExecQueue();
  private readonly requestQueue = new ExecQueue();
  private readonly server: WebSocketServer;

  static async create(): Promise<WSServer> {
    const server = new WSServer();
    await server.loadPersistentState();
    return server;
  }

  private static dispatch(wsClient: WebSocket, action: Action<any>): void {
    wsClient.send(JSON.stringify(action));
  }

  private constructor() {
    this.files = Object.fromEntries(
      fileSaver.defaultFiles
        .filter(({ shared }) => shared)
        .map(({ name }) => [
          name,
          {
            clients: [],
            code: '',
            codeHash: computeHash(''),
            history: new History(),
          },
        ])
    );
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
    filename: string,
    action: Action<any> | ((client: Client) => Action<any> | undefined)
  ): void {
    const actionCreator = typeof action === 'function' ? action : () => action;

    this.server.clients.forEach((wsClient) => {
      if (wsClient.readyState === WebSocket.OPEN) {
        const client = this.getClientFromWS(filename, wsClient);
        const clientAction = actionCreator(client);

        if (clientAction !== undefined) {
          WSServer.dispatch(wsClient, actionCreator(client) as Action);
        }
      }
    });
  }

  private fixCursorOffsets(filename: string): void {
    const fileState = this.files[filename];
    const codeLength = fileState.code.length;

    for (const client of fileState.clients) {
      if (client.selection[0] > codeLength) {
        this.updateClientSelection(
          filename,
          client,
          createSelection(codeLength)
        );
      }
    }
  }

  private getClientFromWS(filename: string, wsClient: WebSocket): Client {
    const client = this.files[filename].clients.find(
      ({ ws }) => ws === wsClient
    );

    if (client === undefined) {
      throw new Error('Unable to find client');
    }
    return client;
  }

  private getCursors(filename: string): ClientCursor[] {
    return this.files[filename].clients.map(
      ({ cursorColor, id, selection }) => ({
        clientID: id,
        color: cursorColor,
        selection,
      })
    );
  }

  private handleConnection(wsClient: WebSocket): void {
    wsClient.on('close', () => {
      for (const [filename, { clients }] of Object.entries(this.files)) {
        const clientIndex = clients.findIndex(({ ws }) => ws === wsClient);

        if (clientIndex !== -1) {
          clients.splice(clientIndex, 1);
          this.sendCursors(filename);
        }
      }
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

  private async loadPersistentState(): Promise<void> {
    try {
      const state: PersistentState = JSON.parse(
        await fs.readFile(PERSISTENT_STATE_FILE_PATH, 'utf8')
      );

      for (const [filename, { code, historyState }] of Object.entries(state)) {
        const fileState = this.files[filename];
        fileState.code = code;
        fileState.codeHash = computeHash(code);
        fileState.history = new History(historyState);
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
        return; // File does not exist
      }
      throw error;
    }
  }

  private reduce(wsClient: WebSocket, action: Action<any>): void {
    const [type] = action;

    switch (type) {
      case serverActions.subscribe.type: {
        const [, payload] = action as ActionFromFactory<
          typeof serverActions.subscribe
        >;
        const { f: filename } = payload;

        this.subscribe(filename, wsClient);
        break;
      }

      case serverActions.redo.type:
      case serverActions.undo.type: {
        const [, payload] = action as ActionFromFactory<
          typeof serverActions.redo | typeof serverActions.undo
        >;
        const { f: filename } = payload;
        const fileState = this.files[filename];
        const client = this.getClientFromWS(filename, wsClient);
        const historyFunction =
          type === serverActions.undo.type ? 'undo' : 'redo';
        const state = fileState.history[historyFunction](fileState.code);

        if (state === undefined) {
          return;
        }
        const { code, selection } = state;

        this.dispatchAll(filename, ({ id }) =>
          clientActions.applyState.create({
            s: id === client.id ? { code, selection } : { code },
          })
        );
        this.updateClientSelection(filename, client, selection, true);
        this.updateCode(filename, code);
        break;
      }

      case serverActions.updateClientSelection.type: {
        const [, payload] = action as ActionFromFactory<
          typeof serverActions.updateClientSelection
        >;
        const { f: filename, s: selection } = payload;
        const client = this.getClientFromWS(filename, wsClient);

        this.updateClientSelection(
          filename,
          client,
          createSelection(selection)
        );
        break;
      }

      case serverActions.updateCode.type: {
        const [, payload] = action as ActionFromFactory<
          typeof serverActions.updateCode
        >;
        const {
          cs: currentSelection,
          d: diffs,
          f: filename,
          ns: newSelection,
          sh: safetyHash,
        } = payload;
        const fileState = this.files[filename];
        const client = this.getClientFromWS(filename, wsClient);

        if (currentSelection === undefined || newSelection === undefined) {
          return;
        }
        const code = diffs.reduce(applyDiff, fileState.code);

        if (safetyHash !== fileState.codeHash) {
          // Requested update is obsolete so we reset client code
          WSServer.dispatch(
            wsClient,
            clientActions.applyState.create({ s: { code: fileState.code } })
          );
          return;
        }
        this.dispatchAll(filename, ({ id }) =>
          clientActions.applyCodeChange.create(
            id === client.id ? { d: diffs, ns: newSelection } : { d: diffs }
          )
        );
        this.updateClientSelection(filename, client, newSelection, true);
        fileState.history.pushState(
          {
            code: fileState.code,
            selection: currentSelection,
          },
          {
            code,
            selection: newSelection,
          }
        );
        this.updateCode(filename, code);
        break;
      }

      default:
        throw new Error(`Unknown action: ${JSON.stringify(action)}`);
    }
  }

  private savePersistentState(): void {
    const persistentState: PersistentState = Object.fromEntries(
      Object.entries(this.files).map(([filename, { code, history }]) => [
        filename,
        { code, historyState: history.state },
      ])
    );

    // Avoids race conditions
    this.fsUpdateQueue.enqueue(async () =>
      fs.writeFile(PERSISTENT_STATE_FILE_PATH, JSON.stringify(persistentState))
    );
  }

  private sendCursors(filename: string): void {
    const cursors = this.getCursors(filename);
    this.dispatchAll(filename, (client) =>
      clientActions.applyForeignCursors.create({
        c: cursors.filter(({ clientID }) => clientID !== client.id),
      })
    );
  }

  private subscribe(filename: string, wsClient: WebSocket): void {
    const fileState = this.files[filename];
    const id = ++this.clientID;
    const colorsUsed = fileState.clients.map((c) => c.cursorColor);
    const cursorColor =
      CURSOR_COLORS.find((color) => !colorsUsed.includes(color)) || 'white';

    const client = {
      cursorColor,
      id,
      selection: createSelection(0),
      ws: wsClient,
    };
    fileState.clients.push(client);

    const state = {
      code: fileState.code,
      cursorColor,
      id,
    };
    WSServer.dispatch(wsClient, clientActions.applyState.create({ s: state }));
    this.sendCursors(filename);
  }

  private updateCode(filename: string, code: string): void {
    const fileState = this.files[filename];

    fileState.code = code;
    fileState.codeHash = computeHash(code);

    this.fixCursorOffsets(filename);
    this.savePersistentState();
  }

  private updateClientSelection(
    filename: string,
    client: Client,
    selection: Selection,
    excludeClient = false
  ): void {
    client.selection = selection;
    const minifiedSelection = minifySelection(selection);

    this.dispatchAll(filename, ({ id }) => {
      if (id !== client.id) {
        return clientActions.applyForeignSelection.create({
          cid: client.id,
          s: minifiedSelection,
        });
      }
      if (!excludeClient) {
        return clientActions.applySelection.create({ s: minifiedSelection });
      }
    });
  }
}
