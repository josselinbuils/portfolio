import bodyParser from 'body-parser';
import express, { Express, NextFunction, Request, Response } from 'express';
import path from 'path';
import serveStatic from 'serve-static';
import { ENV_DEV } from '../constants';
import { Logger } from '../Logger';
import { registerDicomRoutes } from './api/dicom';
import { registerJamendoRoutes } from './api/jamendo';
import { registerRedditRoutes } from './api/reddit';
import { applyAssetsCompression } from './applyAssetsCompression';
import { applyCacheRules } from './applyCacheRules';
import {
  API_URL_PATH,
  ASSETS_DIR,
  ASSETS_URL_PATH,
  CLIENT_DIST_DIR,
  HTTP_DEFAULT_PREFIX,
  HTTP_INTERNAL_ERROR,
  HTTP_NOT_FOUND,
} from './constants';

const ENV = process.env.NODE_ENV || ENV_DEV;
const ASSETS_FS_PATH = path.join(process.cwd(), ASSETS_DIR);
const CLIENT_PATH = path.join(process.cwd(), CLIENT_DIST_DIR);
const HTTP_PREFIX = process.env.HTTP_PREFIX || HTTP_DEFAULT_PREFIX;

export function registerRouter(app: Express): Express {
  Logger.info('Initializes router');

  const mainRouter = express.Router();
  const apiRouter = express.Router();

  mainRouter.use((req, res, next) => {
    Logger.info(`<- ${req.method} ${req.url}`);

    if (ENV === ENV_DEV) {
      res.set('Access-Control-Allow-Origin', '*');
    }
    next();
  });

  applyCacheRules(mainRouter);
  applyAssetsCompression(mainRouter);

  mainRouter.use(ASSETS_URL_PATH, serveStatic(ASSETS_FS_PATH));
  mainRouter.use(serveStatic(CLIENT_PATH));

  apiRouter.use(bodyParser.json());
  registerDicomRoutes(apiRouter);
  registerJamendoRoutes(apiRouter);
  registerRedditRoutes(apiRouter);
  mainRouter.use(API_URL_PATH, apiRouter);

  mainRouter.get('*', (req, res) => res.status(HTTP_NOT_FOUND).end());

  // next is required even if not used
  // noinspection JSUnusedLocalSymbols
  mainRouter.use(
    (error: Error, req: Request, res: Response, next: NextFunction) => {
      Logger.error(error.stack as string);
      res.status(HTTP_INTERNAL_ERROR).end();
    }
  );

  return app.use(HTTP_PREFIX, mainRouter);
}
