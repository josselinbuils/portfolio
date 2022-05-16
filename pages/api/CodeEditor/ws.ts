import { Server } from 'node:http';
import { NextApiRequest, NextApiResponse } from 'next';
import { WSServer } from '~/apps/CodeEditor/api/WSServer';

let wsServer: WSServer;

/** Starts the WebSocket server used to share code if necessary. */
export default async function ws(
  { socket, url }: NextApiRequest,
  res: NextApiResponse
): Promise<void> {
  if (wsServer === undefined) {
    const httpServer: Server = (socket as any).server;

    wsServer = await WSServer.create();

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
