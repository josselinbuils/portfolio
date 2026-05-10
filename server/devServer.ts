import express from 'express';
import path from 'node:path';

import { PUBLIC_DIR } from './constants';
import { startServer } from './startServer';

const PUBLIC_PATH = path.join(process.cwd(), PUBLIC_DIR);

(async () => {
  const { createServer: createViteServer } = await import('vite');

  const viteDevServer = await createViteServer({
    server: { middlewareMode: true },
  });

  await startServer((router) => {
    router.use(express.static(PUBLIC_PATH, { maxAge: 0 }));
    router.use(viteDevServer.middlewares);
  });
})();
