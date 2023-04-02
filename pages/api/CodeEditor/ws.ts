import type { Server } from 'node:http';
import type { NextApiRequest, NextApiResponse } from 'next';
import { WSServer } from '~/apps/CodeEditor/api/WSServer';
import { SharedFileWSPlugin } from '~/apps/CodeEditor/components/Editor/hooks/useSharedFile/SharedFileWSPlugin';
import { fileSaver } from '~/apps/CodeEditor/components/Editor/utils/fileSaver';

let wsServer: WSServer;

/** Starts the WebSocket server used to share code if necessary. */
export default async function ws(
  { socket, url }: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (wsServer === undefined) {
    const httpServer: Server = (socket as any).server;

    wsServer = new WSServer();

    await wsServer.init(
      fileSaver.defaultFiles
        .filter(({ shared }) => shared)
        .map(({ name }) => new SharedFileWSPlugin(wsServer, name))
    );

    httpServer.on('upgrade', (req) => {
      if (req.url === url) {
        wsServer.handleUpgrade(req);
      }
    });
  }
  res.end();
}

export const config = {
  api: { bodyParser: false },
};
