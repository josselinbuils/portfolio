import { type WSClient } from '~/apps/CodeEditor/api/WSClient';
import { type WSPlugin, type WSServer } from '~/apps/CodeEditor/api/WSServer';
import { type Action } from '~/platform/state/interfaces/Action';
import { type ActionFromFactory } from '~/platform/state/interfaces/ActionFactory';
import { type Grid } from './GameManager';
import { getInitialGrid } from './GameManager';
import * as clientActions from './clientActions';
import * as serverActions from './serverActions';

export class TicTacToeWSPlugin implements WSPlugin {
  readonly name = 'ticTacToe';
  private readonly clients: WSClient[] = [];
  private grid = getInitialGrid();
  private readonly wsServer: WSServer;

  constructor(wsServer: WSServer) {
    this.wsServer = wsServer;
  }

  loadPersistentState(grid: Grid): void {
    this.grid = grid;
  }

  onWSClientClose(wsClient: WSClient): void {
    this.clients.splice(this.clients.indexOf(wsClient), 1);
  }

  reduce(wsClient: WSClient, action: Action<any>): void {
    const [type] = action;

    switch (type) {
      case serverActions.placeMark.type: {
        const [, { mark, x, y }] = action as ActionFromFactory<
          typeof serverActions.placeMark
        >;

        if (
          !['o', 'x'].includes(mark) ||
          ![0, 1, 2].includes(x) ||
          ![0, 1, 2].includes(y)
        ) {
          throw new Error('Invalid placeMark payload from client.');
        }

        this.grid[y][x] = mark;
        this.dispatchAll(clientActions.apply.create(this.grid));
        this.savePersistentState();
        break;
      }

      case serverActions.reset.type:
        this.grid = getInitialGrid();
        this.dispatchAll(clientActions.apply.create(this.grid));
        this.savePersistentState();
        break;

      case serverActions.subscribe.type:
        this.clients.push(wsClient);
        wsClient.dispatch(clientActions.apply.create(this.grid));
        break;

      default:
      // Ignore action
    }
  }

  private dispatchAll(action: Action<any>): void {
    this.clients.forEach((wsClient) => wsClient.dispatch(action));
  }

  private savePersistentState(): void {
    this.wsServer.savePersistentState(this.name, this.grid);
  }
}
