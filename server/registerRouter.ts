import bodyParser from 'body-parser';
import express, { Express, NextFunction, Request, Response } from 'express';
import { existsSync } from 'fs';
import { join } from 'path';
import serveStatic from 'serve-static';
import { registerJamendoRoutes } from './api/jamendo';
import { registerRedditRoutes } from './api/reddit';
import {
  ASSETS_DIR,
  ASSETS_DIR_DEV,
  ENV_DEV,
  HTTP_DEFAULT_PREFIX,
  HTTP_INTERNAL_ERROR,
  HTTP_NOT_FOUND,
  MAX_AGE_DAYS,
  PUBLIC_DIR
} from './constants';
import { Logger } from './Logger';

const ENV = process.env.NODE_ENV || ENV_DEV;
const ASSETS_PATH = join(
  process.cwd(),
  ENV === ENV_DEV ? ASSETS_DIR_DEV : ASSETS_DIR
);
const CLIENT_PATH = join(process.cwd(), PUBLIC_DIR);
const HTTP_PREFIX = process.env.HTTP_PREFIX || HTTP_DEFAULT_PREFIX;

export function registerRouter(app: Express): Express {
  Logger.info('Initializes router');

  const router = express.Router();

  router.use((req, res, next) => {
    Logger.info(`<- ${req.method} ${req.url}`);

    if (ENV === ENV_DEV) {
      res.set('Access-Control-Allow-Origin', '*');
      res.set(
        'Access-Control-Allow-Headers',
        'Origin, X-Requested-With, Content-Type, Accept'
      );
    }
    next();
  });

  router.use(ASSETS_DIR, (req, res, next) => {
    const gzPath = join(ASSETS_PATH, `${req.url}.gz`);

    if (existsSync(gzPath)) {
      req.url += '.gz';
      res.set('Content-Encoding', 'gzip');
      res.set('Content-Type', 'application/octet-stream');
    }
    next();
  });

  const assetsOptions = {
    immutable: true,
    maxAge: MAX_AGE_DAYS * 24 * 60 * 60 * 1000
  };
  router.use(ASSETS_DIR, serveStatic(ASSETS_PATH, assetsOptions));
  router.use(serveStatic(CLIENT_PATH));
  router.use(bodyParser.json());

  // registerDicomRoutes(router);
  registerJamendoRoutes(router);
  registerRedditRoutes(router);

  router.get('*', (req, res) => res.status(HTTP_NOT_FOUND).end());

  // next is required even if not used
  // noinspection JSUnusedLocalSymbols
  router.use(
    (error: Error, req: Request, res: Response, next: NextFunction) => {
      Logger.error(error.stack as string);
      res.status(HTTP_INTERNAL_ERROR).end();
    }
  );

  return app.use(HTTP_PREFIX, router);
}
