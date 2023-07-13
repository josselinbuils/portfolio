import type { Server } from 'node:http';
import { type Router } from 'express';
import { TicTacToeWSPlugin } from '../components/Editor/games/TicTacToe/utils/TicTacToeWSPlugin';
import { SharedFileWSPlugin } from '../components/Editor/hooks/useSharedFile/SharedFileWSPlugin';
import { WSServer } from './WSServer';

let wsServer: WSServer;

const sharedFiles = ['shared.js', 'ticTacToe.js'];

export default async (router: Router, httpServer: Server) => {
  if (wsServer === undefined) {
    wsServer = new WSServer();

    await wsServer.init([
      ...sharedFiles.map((name) => new SharedFileWSPlugin(wsServer, name)),
      new TicTacToeWSPlugin(wsServer),
    ]);

    httpServer.on('upgrade', (req) => {
      if (req.url === '/api/CodeEditor/ws') {
        wsServer.handleUpgrade(req);
      }
    });
  }

  router.get('/ws', (_, res) => res.end());
};
