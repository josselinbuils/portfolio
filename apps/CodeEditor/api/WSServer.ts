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
  reduce(wsClient: WebSocket, action: Action<any>): unknown;
  onClientOpen?(client: WSClient): unknown;
  onClientClose?(client: WSClient): unknown;
}

export interface WSPluginCreator {
  create(wsServer: WSServer): WSPlugin;
}

export class WSServer {
  readonly clients = [] as WSClient[];
  private readonly fsUpdateQueue = new ExecQueue();
  private readonly plugins: WSPlugin[];
  private readonly requestQueue = new ExecQueue();
  private readonly server: WebSocketServer;
  private state: { [pluginName: string]: unknown } = {};

  static async create(pluginsCreators: WSPluginCreator[]): Promise<WSServer> {
    const server = new WSServer(pluginsCreators);
    await server.loadPersistentState();
    return server;
  }

  private constructor(pluginsCreators: WSPluginCreator[]) {
    this.plugins = pluginsCreators.map((pluginsCreator) =>
      pluginsCreator.create(this)
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

  getClientFromWS(wsClient: WebSocket): WSClient {
    const client = this.clients.find(({ ws }) => ws === wsClient);

    if (client === undefined) {
      throw new Error('Unable to find client');
    }
    return client;
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

  private handleConnection(wsClient: WebSocket): void {
    this.requestQueue.enqueue(() => {
      const client = new WSClient(wsClient);
      this.clients.push(client);

      for (const plugin of this.plugins) {
        plugin.onClientOpen?.(client);
      }

      wsClient.on('close', () => {
        const clientIndex = this.clients.indexOf(client);

        if (clientIndex !== -1) {
          this.clients.splice(clientIndex, 1);
        }

        for (const plugin of this.plugins) {
          plugin.onClientClose?.(client);
        }
      });

      wsClient.on('message', (data) => {
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
