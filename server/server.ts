import path from 'node:path';
import express from 'express';
import { ASSETS_MAX_AGE_MS, CLIENT_DIST_DIR, PUBLIC_DIR } from './constants';
import { startServer } from './startServer';

const CLIENT_PATH = path.join(process.cwd(), CLIENT_DIST_DIR);
const PUBLIC_PATH = path.join(process.cwd(), PUBLIC_DIR);

startServer([
  express.static(CLIENT_PATH, { maxAge: ASSETS_MAX_AGE_MS }),
  express.static(PUBLIC_PATH, { maxAge: ASSETS_MAX_AGE_MS }),
]);
