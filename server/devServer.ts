import path from 'node:path';
import express from 'express';
import { PUBLIC_DIR } from './constants';
import { startServer } from './startServer';

const PUBLIC_PATH = path.join(process.cwd(), PUBLIC_DIR);

(async () => {
  // eslint-disable-next-line import/no-extraneous-dependencies
  const { createServer: createViteServer } = await import('vite');

  const viteDevServer = await createViteServer({
    server: { middlewareMode: true },
  });

  await startServer([
    express.static(PUBLIC_PATH, { maxAge: 0 }),
    viteDevServer.middlewares,
  ]);
})();
