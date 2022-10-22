import type WebSocket from 'ws';

export class WSClient {
  private static clientID = -1;
  id: number;
  ws: WebSocket;
  private readonly state: { [pluginName: string]: unknown } = {};

  constructor(ws: WebSocket) {
    this.id = ++WSClient.clientID;
    this.ws = ws;
  }

  getState<State>(pluginName: string): State | undefined {
    return this.state[pluginName] as State;
  }

  setState(pluginName: string, state: unknown): void {
    this.state[pluginName] = state;
  }
}
