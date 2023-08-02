import type { Server } from 'node:http';
import { type Router } from 'express';
import { WSServer } from './WSServer';

let wsServer: WSServer;

export default async (router: Router, httpServer: Server) => {
  if (wsServer === undefined) {
    wsServer = new WSServer();

    await wsServer.init();

    httpServer.on('upgrade', (req) => {
      if (req.url === '/api/CodeEditor/ws') {
        wsServer.handleUpgrade(req);
      }
    });
  }

  router.get('/ws', (_, res) => res.end());
};
