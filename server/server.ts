import path from 'node:path';
import express from 'express';
import { ASSETS_MAX_AGE_SECONDS, CLIENT_DIST_DIR } from './constants';
import { startServer } from './startServer';

const CLIENT_PATH = path.join(process.cwd(), CLIENT_DIST_DIR);

startServer([express.static(CLIENT_PATH, { maxAge: ASSETS_MAX_AGE_SECONDS })]);
