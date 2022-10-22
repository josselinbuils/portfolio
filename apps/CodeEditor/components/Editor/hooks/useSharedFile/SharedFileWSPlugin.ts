import WebSocket from 'ws';
import { WSClient } from '~/apps/CodeEditor/api/WSClient';
import { WSServer } from '~/apps/CodeEditor/api/WSServer';
import { ClientCursor } from '~/apps/CodeEditor/interfaces/ClientCursor';
import { Selection } from '~/apps/CodeEditor/interfaces/Selection';
import { History, HistoryState } from '~/apps/CodeEditor/utils/History';
import { createSelection } from '~/apps/CodeEditor/utils/createSelection';
import { applyDiff } from '~/apps/CodeEditor/utils/diffs';
import { minifySelection } from '~/apps/CodeEditor/utils/minifySelection';
import { Action } from '~/platform/state/interfaces/Action';
import { ActionFromFactory } from '~/platform/state/interfaces/ActionFactory';
import { computeHash } from '~/platform/utils/computeHash';
import { fileSaver } from '../../utils/fileSaver';
import * as clientActions from './clientActions';
import * as serverActions from './serverActions';

const CURSOR_COLORS = ['red', 'fuchsia', 'yellow', 'orange', 'aqua', 'green'];

interface ClientState {
  cursorColor: string;
  filename: string | undefined;
  selection: Selection;
}

interface FileState {
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

export class SharedFileWSPlugin {
  readonly name = 'sharedFile';
  private readonly files: { [filename: string]: FileState };
  private readonly wsServer: WSServer;

  static create(wSServer: WSServer): SharedFileWSPlugin {
    return new SharedFileWSPlugin(wSServer);
  }

  private static dispatch(wsClient: WebSocket, action: Action<any>): void {
    if (wsClient.readyState === WebSocket.OPEN) {
      wsClient.send(JSON.stringify(action));
    }
  }

  private constructor(wsServer: WSServer) {
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
    this.wsServer = wsServer;
  }

  async loadPersistentState(state: PersistentState): Promise<void> {
    try {
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

  onClientClose(client: WSClient): void {
    const { filename } = this.getClientState(client);

    if (filename !== undefined) {
      this.sendCursors(filename);
    }
  }

  onClientOpen(client: WSClient): void {
    const colorsUsed = this.wsServer.clients
      .map((c) => c.getState<ClientState>(this.name)?.cursorColor)
      .filter(Boolean);

    const cursorColor =
      CURSOR_COLORS.find((color) => !colorsUsed.includes(color)) || 'white';

    client.setState(this.name, {
      cursorColor,
      filename: undefined,
      selection: createSelection(0),
    });
  }

  reduce(wsClient: WebSocket, action: Action<any>): void {
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
        const client = this.getClientFromWS(wsClient);
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
        const client = this.getClientFromWS(wsClient);

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
        const client = this.getClientFromWS(wsClient);

        if (currentSelection === undefined || newSelection === undefined) {
          return;
        }
        const code = diffs.reduce(applyDiff, fileState.code);

        if (safetyHash !== fileState.codeHash) {
          // Requested update is obsolete so we reset client code
          SharedFileWSPlugin.dispatch(
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

  private dispatchAll(
    filename: string,
    action: Action<any> | ((client: WSClient) => Action<any> | undefined)
  ): void {
    const actionCreator = typeof action === 'function' ? action : () => action;

    this.getFileClients(filename).forEach((client) => {
      const clientAction = actionCreator(client);

      if (clientAction !== undefined) {
        SharedFileWSPlugin.dispatch(client.ws, actionCreator(client) as Action);
      }
    });
  }

  private fixCursorOffsets(filename: string): void {
    const clients = this.getFileClients(filename);
    const fileState = this.files[filename];
    const codeLength = fileState.code.length;

    for (const client of clients) {
      if (this.getClientState(client).selection[0] > codeLength) {
        this.updateClientSelection(
          filename,
          client,
          createSelection(codeLength)
        );
      }
    }
  }

  private getClientFromWS(wsClient: WebSocket): WSClient {
    const client = this.wsServer.clients.find(({ ws }) => ws === wsClient);

    if (client === undefined) {
      throw new Error('Unable to find client');
    }
    return client;
  }

  private getClientState(client: WSClient): ClientState {
    const clientState = client.getState<ClientState>(this.name);

    if (clientState === undefined) {
      throw new Error('Unable to retrieve client state');
    }
    return clientState;
  }

  private getCursors(filename: string): ClientCursor[] {
    return this.getFileClients(filename).map((client) => {
      const { cursorColor, selection } = this.getClientState(client);

      return {
        clientID: client.id,
        color: cursorColor,
        selection,
      };
    });
  }

  private getFileClients(filename: string): WSClient[] {
    return (this.wsServer.clients as WSClient[]).filter(
      (client) => this.getClientState(client).filename === filename
    );
  }

  private savePersistentState(): void {
    const persistentState: PersistentState = Object.fromEntries(
      Object.entries(this.files).map(([filename, { code, history }]) => [
        filename,
        { code, historyState: history.state },
      ])
    );
    this.wsServer.savePersistentState(this.name, persistentState);
  }

  private sendCursors(filename: string): void {
    const cursors = this.getCursors(filename);
    this.dispatchAll(filename, (client) =>
      clientActions.applyForeignCursors.create({
        c: cursors.filter(({ clientID }) => clientID !== client.id),
      })
    );
  }

  private setClientState(client: WSClient, state: Partial<ClientState>): void {
    return client.setState(this.name, {
      ...this.getClientState(client),
      ...state,
    });
  }

  private subscribe(filename: string, wsClient: WebSocket): void {
    const client = this.getClientFromWS(wsClient);
    const { cursorColor } = this.getClientState(client);
    const fileState = this.files[filename];

    this.setClientState(client, { filename });

    const state = {
      code: fileState.code,
      cursorColor,
      id: client.id,
    };
    SharedFileWSPlugin.dispatch(
      wsClient,
      clientActions.applyState.create({ s: state })
    );
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
    client: WSClient,
    selection: Selection,
    excludeClient = false
  ): void {
    const minifiedSelection = minifySelection(selection);

    this.setClientState(client, { selection });
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
