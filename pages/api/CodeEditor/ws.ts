import { Server } from 'http';
import { NextApiRequest, NextApiResponse } from 'next';
import { WSServer } from '~/apps/CodeEditor/api/WSServer';

let wsServer: WSServer;

/** Starts the WebSocket server used to share code if necessary. */
export default function ws(
  { socket, url }: NextApiRequest,
  res: NextApiResponse
): void {
  if (wsServer === undefined) {
    const httpServer: Server = (socket as any).server;

    wsServer = WSServer.create();

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
