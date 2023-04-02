import WebSocket from 'ws';
import type { WSClient } from '~/apps/CodeEditor/api/WSClient';
import type { WSPlugin, WSServer } from '~/apps/CodeEditor/api/WSServer';
import type { ClientCursor } from '~/apps/CodeEditor/interfaces/ClientCursor';
import type { Selection } from '~/apps/CodeEditor/interfaces/Selection';
import type { HistoryState } from '~/apps/CodeEditor/utils/History';
import { History } from '~/apps/CodeEditor/utils/History';
import { createSelection } from '~/apps/CodeEditor/utils/createSelection';
import { applyDiff } from '~/apps/CodeEditor/utils/diffs';
import { minifySelection } from '~/apps/CodeEditor/utils/minifySelection';
import type { Action } from '~/platform/state/interfaces/Action';
import type { ActionFromFactory } from '~/platform/state/interfaces/ActionFactory';
import { computeHash } from '~/platform/utils/computeHash';
import * as clientActions from './clientActions';
import * as serverActions from './serverActions';
import type { SharedFileServerBaseAction } from './serverActions';

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
  code: string;
  historyState: HistoryState;
}

export class SharedFileWSPlugin implements WSPlugin {
  readonly name: string;
  private readonly filename: string;
  private readonly fileState: FileState = {
    code: '',
    codeHash: computeHash(''),
    history: new History(),
  };
  private readonly wsServer: WSServer;

  private static dispatch(wsClient: WebSocket, action: Action<any>): void {
    if (wsClient.readyState === WebSocket.OPEN) {
      wsClient.send(JSON.stringify(action));
    }
  }

  constructor(wsServer: WSServer, filename: string) {
    this.filename = filename;
    this.name = `sharedFile:${filename}`;
    this.wsServer = wsServer;
  }

  async loadPersistentState({
    code,
    historyState,
  }: PersistentState): Promise<void> {
    const { fileState } = this;

    fileState.code = code;
    fileState.codeHash = computeHash(code);
    fileState.history = new History(historyState);
  }

  onClientClose(): void {
    this.sendCursors();
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
    const [type, { f: filename }] =
      action as Action<SharedFileServerBaseAction>;

    if (filename !== this.filename) {
      return;
    }

    switch (type) {
      case serverActions.subscribe.type:
        this.subscribe(wsClient);
        break;

      case serverActions.redo.type:
      case serverActions.undo.type: {
        const { fileState } = this;
        const client = this.getClientFromWS(wsClient);
        const historyFunction =
          type === serverActions.undo.type ? 'undo' : 'redo';
        const state = fileState.history[historyFunction](fileState.code);

        if (state === undefined) {
          return;
        }
        const { code, selection } = state;

        this.dispatchAll(({ id }) =>
          clientActions.applyState.create({
            s: id === client.id ? { code, selection } : { code },
          })
        );
        this.updateClientSelection(client, selection, true);
        this.updateCode(code);
        break;
      }

      case serverActions.updateClientSelection.type: {
        const [, payload] = action as ActionFromFactory<
          typeof serverActions.updateClientSelection
        >;
        const { s: selection } = payload;
        const client = this.getClientFromWS(wsClient);

        this.updateClientSelection(client, createSelection(selection));
        break;
      }

      case serverActions.updateCode.type: {
        const [, payload] = action as ActionFromFactory<
          typeof serverActions.updateCode
        >;
        const {
          cs: currentSelection,
          d: diffs,
          ns: newSelection,
          sh: safetyHash,
        } = payload;
        const { fileState } = this;
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
        this.dispatchAll(({ id }) =>
          clientActions.applyCodeChange.create(
            id === client.id ? { d: diffs, ns: newSelection } : { d: diffs }
          )
        );
        this.updateClientSelection(client, newSelection, true);
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
        this.updateCode(code);
        break;
      }

      default:
        throw new Error(`Unknown action: ${JSON.stringify(action)}`);
    }
  }

  private dispatchAll(
    action: Action<any> | ((client: WSClient) => Action<any> | undefined)
  ): void {
    const actionCreator = typeof action === 'function' ? action : () => action;

    this.getWSClients().forEach((client) => {
      const clientAction = actionCreator(client);

      if (clientAction !== undefined) {
        SharedFileWSPlugin.dispatch(client.ws, actionCreator(client) as Action);
      }
    });
  }

  private fixCursorOffsets(): void {
    const clients = this.getWSClients();
    const { fileState } = this;
    const codeLength = fileState.code.length;

    for (const client of clients) {
      if (this.getClientState(client).selection[0] > codeLength) {
        this.updateClientSelection(client, createSelection(codeLength));
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

  private getCursors(): ClientCursor[] {
    return this.getWSClients().map((client) => {
      const { cursorColor, selection } = this.getClientState(client);

      return {
        clientID: client.id,
        color: cursorColor,
        selection,
      };
    });
  }

  private getWSClients(): WSClient[] {
    return (this.wsServer.clients as WSClient[]).filter(
      (client) => this.getClientState(client).filename === this.filename
    );
  }

  private savePersistentState(): void {
    const { code, history } = this.fileState;

    this.wsServer.savePersistentState(this.name, {
      code,
      historyState: history.state,
    });
  }

  private sendCursors(): void {
    const cursors = this.getCursors();
    this.dispatchAll((client) =>
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

  private subscribe(wsClient: WebSocket): void {
    const client = this.getClientFromWS(wsClient);
    const { cursorColor } = this.getClientState(client);
    const { filename, fileState } = this;

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
    this.sendCursors();
  }

  private updateCode(code: string): void {
    const { fileState } = this;

    fileState.code = code;
    fileState.codeHash = computeHash(code);

    this.fixCursorOffsets();
    this.savePersistentState();
  }

  private updateClientSelection(
    client: WSClient,
    selection: Selection,
    excludeClient = false
  ): void {
    const minifiedSelection = minifySelection(selection);

    this.setClientState(client, { selection });
    this.dispatchAll(({ id }) => {
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
