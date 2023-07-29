import { type WSClient } from '@/apps/CodeEditor/api/WSClient';
import { type WSPlugin, type WSServer } from '@/apps/CodeEditor/api/WSServer';
import { type ClientCursor } from '@/apps/CodeEditor/interfaces/ClientCursor';
import { type Selection } from '@/apps/CodeEditor/interfaces/Selection';
import { type HistoryState } from '@/apps/CodeEditor/utils/History';
import { History } from '@/apps/CodeEditor/utils/History';
import { createSelection } from '@/apps/CodeEditor/utils/createSelection';
import { applyDiff } from '@/apps/CodeEditor/utils/diffs';
import { minifySelection } from '@/apps/CodeEditor/utils/minifySelection';
import { type Action } from '@/platform/state/interfaces/Action';
import { type PayloadFromFactory } from '@/platform/state/interfaces/ActionFactory';
import { computeHash } from '@/platform/utils/computeHash';
import { fileSaver } from '../../utils/fileSaver';
import * as clientActions from './clientActions';
import * as serverActions from './serverActions';
import { type SharedFileServerBaseAction } from './serverActions';

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

const sharedFiles = fileSaver.defaultFiles.filter(({ shared }) => shared);

export default class SharedFileWsPlugin implements WSPlugin {
  readonly name = 'sharedFile';
  private readonly state: Record<string, FileState> = Object.fromEntries(
    sharedFiles.map(({ content, name }) => [
      name,
      {
        code: content,
        codeHash: computeHash(content),
        history: new History(),
      },
    ]),
  );
  private readonly wsServer: WSServer;

  constructor(wsServer: WSServer) {
    this.wsServer = wsServer;
  }

  loadPersistentState(persistentState: PersistentState): void {
    Object.entries(persistentState).forEach(
      ([filename, { code, historyState }]) => {
        const fileState = this.state[filename];

        fileState.code = code;
        fileState.codeHash = computeHash(code);
        fileState.history = new History(historyState);
      },
    );
  }

  onWSClientClose(client: WSClient): void {
    const clientState = client.getState<ClientState>(this.name);

    if (clientState !== undefined && clientState.filename !== undefined) {
      this.sendCursors(clientState.filename);
    }
  }

  onWSClientOpen(client: WSClient): void {
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

  reduce(wsClient: WSClient, action: Action<any>): void {
    const [type, payload] = action as Action<SharedFileServerBaseAction>;

    if (!payload || this.state[payload.f] === undefined) {
      return;
    }

    switch (type) {
      case serverActions.subscribe.type: {
        const filename = payload.f;
        this.subscribe(filename, wsClient);
        break;
      }

      case serverActions.redo.type:
      case serverActions.undo.type: {
        const filename = payload.f;
        const fileState = this.state[filename];
        const historyFunction =
          type === serverActions.undo.type ? 'undo' : 'redo';
        const state = fileState.history[historyFunction](fileState.code);

        if (state === undefined) {
          return;
        }
        const { code, selection } = state;

        this.dispatchAll(filename, ({ id }) =>
          clientActions.applyState.create({
            s: id === wsClient.id ? { code, selection } : { code },
          }),
        );
        this.updateClientSelection(wsClient, selection, true);
        this.updateCode(filename, code);
        break;
      }

      case serverActions.updateClientSelection.type: {
        const { s: selection } = payload as PayloadFromFactory<
          typeof serverActions.updateClientSelection
        >;

        this.updateClientSelection(wsClient, createSelection(selection));
        break;
      }

      case serverActions.updateCode.type: {
        const {
          cs: currentSelection,
          d: diffs,
          ns: newSelection,
          sh: safetyHash,
        } = payload as PayloadFromFactory<typeof serverActions.updateCode>;

        const filename = payload.f;
        const fileState = this.state[filename];

        if (currentSelection === undefined || newSelection === undefined) {
          return;
        }
        const code = diffs.reduce(applyDiff, fileState.code);

        if (safetyHash !== fileState.codeHash) {
          // Requested update is obsolete so we reset client code
          wsClient.dispatch(
            clientActions.applyState.create({ s: { code: fileState.code } }),
          );
          return;
        }
        this.dispatchAll(filename, ({ id }) =>
          clientActions.applyCodeChange.create(
            id === wsClient.id ? { d: diffs, ns: newSelection } : { d: diffs },
          ),
        );
        this.updateClientSelection(wsClient, newSelection, true);
        fileState.history.pushState(
          {
            code: fileState.code,
            selection: currentSelection,
          },
          {
            code,
            selection: newSelection,
          },
        );
        this.updateCode(filename, code);
        break;
      }

      default:
      // Ignore action
    }
  }

  private dispatchAll(
    filename: string,
    action: Action<any> | ((client: WSClient) => Action<any> | undefined),
  ): void {
    const actionCreator = typeof action === 'function' ? action : () => action;

    this.getWSClients(filename).forEach((wsClient) => {
      const clientAction = actionCreator(wsClient);

      if (clientAction !== undefined) {
        wsClient.dispatch(actionCreator(wsClient) as Action);
      }
    });
  }

  private fixCursorOffsets(filename: string): void {
    const clients = this.getWSClients(filename);
    const fileState = this.state[filename];
    const codeLength = fileState.code.length;

    for (const client of clients) {
      if (this.getClientState(client).selection[0] > codeLength) {
        this.updateClientSelection(client, createSelection(codeLength));
      }
    }
  }

  private getClientState(client: WSClient): ClientState {
    const clientState = client.getState<ClientState>(this.name);

    if (clientState === undefined) {
      throw new Error('Unable to retrieve client state');
    }
    return clientState;
  }

  private getCursors(filename: string): ClientCursor[] {
    return this.getWSClients(filename).map((client) => {
      const { cursorColor, selection } = this.getClientState(client);

      return {
        clientID: client.id,
        color: cursorColor,
        selection,
      };
    });
  }

  private getWSClients(filename: string): WSClient[] {
    return (this.wsServer.clients as WSClient[]).filter(
      (client) => this.getClientState(client).filename === filename,
    );
  }

  private savePersistentState(): void {
    this.wsServer.savePersistentState(
      this.name,
      Object.fromEntries(
        Object.entries(this.state).map(([filename, { code, history }]) => [
          filename,
          { code, historyState: history.state },
        ]),
      ),
    );
  }

  private sendCursors(filename: string): void {
    const cursors = this.getCursors(filename);
    this.dispatchAll(filename, (client) =>
      clientActions.applyForeignCursors.create({
        c: cursors.filter(({ clientID }) => clientID !== client.id),
      }),
    );
  }

  private setClientState(client: WSClient, state: Partial<ClientState>): void {
    return client.setState(this.name, {
      ...this.getClientState(client),
      ...state,
    });
  }

  private subscribe(filename: string, wsClient: WSClient): void {
    const { cursorColor } = this.getClientState(wsClient);
    const { code } = this.state[filename];

    this.setClientState(wsClient, { filename });

    const state = { code, cursorColor, id: wsClient.id };
    wsClient.dispatch(clientActions.applyState.create({ s: state }));
    this.sendCursors(filename);
  }

  private updateCode(filename: string, code: string): void {
    const fileState = this.state[filename];

    fileState.code = code;
    fileState.codeHash = computeHash(code);

    this.fixCursorOffsets(filename);
    this.savePersistentState();
  }

  private updateClientSelection(
    client: WSClient,
    selection: Selection,
    excludeClient = false,
  ): void {
    const minifiedSelection = minifySelection(selection);
    const clientState = client.getState<ClientState>(this.name);

    if (clientState === undefined || clientState.filename === undefined) {
      return;
    }

    this.setClientState(client, { selection });
    this.dispatchAll(clientState.filename, ({ id }) => {
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
