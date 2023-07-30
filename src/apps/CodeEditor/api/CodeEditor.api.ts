import type { Server } from 'node:http';
import bodyParser from 'body-parser';
import { type Router } from 'express';
import { syncRoute } from '@/platform/api/syncRoute';
import { WSServer } from './WSServer';
import { checkTypes } from './checkTypes';

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

  router.post(
    '/check-types',
    bodyParser.text(),
    syncRoute((req) => checkTypes(req.body)),
  );
};
