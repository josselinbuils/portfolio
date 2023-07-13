import { startServer } from './startServer';

(async () => {
  // eslint-disable-next-line import/no-extraneous-dependencies
  const { createServer: createViteServer } = await import('vite');

  const viteDevServer = await createViteServer({
    server: { middlewareMode: true },
  });

  await startServer([viteDevServer.middlewares]);
})();
