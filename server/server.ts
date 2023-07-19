import path from 'node:path';
import express from 'express';
import {
  ASSETS_URL_PATH,
  ASSETS_MAX_AGE_MS,
  DIST_ASSETS_DIR,
  DIST_DIR,
  PUBLIC_DIR,
} from './constants';
import { startServer } from './startServer';

const DIST_ASSETS_PATH = path.join(process.cwd(), DIST_ASSETS_DIR);
const DIST_PATH = path.join(process.cwd(), DIST_DIR);
const PUBLIC_PATH = path.join(process.cwd(), PUBLIC_DIR);

startServer((router) => {
  const options = { maxAge: ASSETS_MAX_AGE_MS };
  router.use(ASSETS_URL_PATH, express.static(DIST_ASSETS_PATH, options));
  router.use(express.static(DIST_PATH));
  router.use(express.static(PUBLIC_PATH, options));
});
