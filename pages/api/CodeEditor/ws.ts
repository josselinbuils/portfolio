import { NextApiRequest } from 'next';
import { WSServer } from '~/apps/CodeEditor/api/WSServer';

let wsServer: WSServer;

export default function ws(req: NextApiRequest): void {
  if (req.headers.upgrade === 'websocket') {
    if (wsServer === undefined) {
      wsServer = WSServer.create();
    }
    wsServer.handleUpgrade(req);
  }
}
