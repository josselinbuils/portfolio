import fs from 'node:fs/promises';
import type { IncomingMessage } from 'node:http';
import path from 'node:path';
import type WebSocket from 'ws';
import { WebSocketServer } from 'ws';
import { Logger } from '~/platform/api/Logger';
import type { Action } from '~/platform/state/interfaces/Action';
import { ExecQueue } from './ExecQueue';
import { WSClient } from './WSClient';

const PERSISTENT_STATE_FILE_PATH = path.join(
  process.cwd(),
  '/persistentState.json'
);

export interface WSPlugin {
  name: string;
  loadPersistentState?(state: any): unknown;
  onWSClientClose?(wsClient: WSClient): unknown;
  onWSClientOpen?(wsClient: WSClient): unknown;
  reduce(wsClient: WSClient, action: Action<any>): unknown;
}

export class WSServer {
  readonly clients = [] as WSClient[];
  private readonly fsUpdateQueue = new ExecQueue();
  private plugins: WSPlugin[] = [];
  private readonly requestQueue = new ExecQueue();
  private readonly server: WebSocketServer;
  private state: { [pluginName: string]: unknown } = {};

  constructor() {
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

  getClientFromWS(ws: WebSocket): WSClient {
    const client = this.clients.find((wsClient) => wsClient.ws === ws);

    if (client === undefined) {
      throw new Error('Unable to find client');
    }
    return client;
  }

  async init(plugins: WSPlugin[]) {
    this.plugins = plugins;
    await this.loadPersistentState();
  }

  savePersistentState(pluginName: string, state: Record<any, any>): void {
    // Avoids race conditions
    this.fsUpdateQueue.enqueue(async () =>
      fs.writeFile(
        PERSISTENT_STATE_FILE_PATH,
        JSON.stringify({ ...this.state, [pluginName]: state })
      )
    );
  }

  private handleConnection(ws: WebSocket): void {
    this.requestQueue.enqueue(() => {
      const wsClient = new WSClient(ws);
      this.clients.push(wsClient);

      for (const plugin of this.plugins) {
        plugin.onWSClientOpen?.(wsClient);
      }

      ws.on('close', () => {
        const clientIndex = this.clients.indexOf(wsClient);

        if (clientIndex !== -1) {
          this.clients.splice(clientIndex, 1);
        }

        for (const plugin of this.plugins) {
          plugin.onWSClientClose?.(wsClient);
        }
      });

      ws.on('message', (data) => {
        this.requestQueue.enqueue(() => {
          try {
            const action = JSON.parse(data.toString()) as Action;

            for (const plugin of this.plugins) {
              plugin.reduce(wsClient, action);
            }
          } catch (error: any) {
            Logger.error(error.stack);
          }
        });
      });
    });
  }

  private async loadPersistentState(): Promise<void> {
    try {
      this.state = JSON.parse(
        await fs.readFile(PERSISTENT_STATE_FILE_PATH, 'utf8')
      );

      for (const plugin of this.plugins) {
        if (plugin.name in this.state) {
          plugin.loadPersistentState?.(this.state[plugin.name]);
        }
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException)?.code === 'ENOENT') {
        return; // File does not exist
      }
      throw error;
    }
  }
}
