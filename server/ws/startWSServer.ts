import { Logger } from '../Logger';
import { WSServer } from './WSServer';

export async function startWSServer(port: number): Promise<void> {
  Logger.info(`Starts WebSocket server`);

  return new Promise<void>((resolve) => {
    WSServer.create(port, () => {
      Logger.info(`WebSocket server is listening on port ${port}`);
      resolve();
    });
  });
}
