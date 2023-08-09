import path from 'node:path';
import express from 'express';
import { glob } from 'glob';
import {
  ASSETS_URL_PATH,
  ASSETS_MAX_AGE_MS,
  DIST_ASSETS_DIR,
  DIST_DIR,
  HTTP_NOT_FOUND,
  PUBLIC_DIR,
} from './constants';
import { startServer } from './startServer';

const DIST_ASSETS_PATH = path.join(process.cwd(), DIST_ASSETS_DIR);
const DIST_PATH = path.join(process.cwd(), DIST_DIR);
const PUBLIC_PATH = path.join(process.cwd(), PUBLIC_DIR);

startServer(async (router) => {
  const options = { maxAge: ASSETS_MAX_AGE_MS };

  const pagePaths = await glob('**/*.html', {
    cwd: path.join(process.cwd(), 'dist'),
  });

  for (const pagePath of pagePaths) {
    const route = `/${pagePath.replace(/\.html$/, '').replace(/index$/, '')}`;

    router.get(route, (_, res) => {
      res.sendFile(path.join(DIST_PATH, pagePath));
    });
  }

  router.use(ASSETS_URL_PATH, express.static(DIST_ASSETS_PATH, options));
  router.use(express.static(DIST_PATH));
  router.use(express.static(PUBLIC_PATH, options));

  router.all('*', (_, res) => {
    res.status(HTTP_NOT_FOUND).sendFile(path.join(DIST_PATH, '404.html'));
  });
});
