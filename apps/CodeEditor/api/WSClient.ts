import WebSocket from 'ws';
import { type Action } from '~/platform/state/interfaces/Action';

export class WSClient {
  private static clientID = -1;
  id: number;
  ws: WebSocket;
  private readonly state: { [pluginName: string]: unknown } = {};

  constructor(ws: WebSocket) {
    this.id = ++WSClient.clientID;
    this.ws = ws;
  }

  dispatch(action: Action<any>): void {
    if (this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(action));
    }
  }

  getState<State>(pluginName: string): State | undefined {
    return this.state[pluginName] as State;
  }

  setState(pluginName: string, state: unknown): void {
    this.state[pluginName] = state;
  }
}
