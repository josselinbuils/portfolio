import http from 'node:http';
import path from 'node:path';
import express, {
  type NextFunction,
  type Request,
  type Response,
  type Router,
} from 'express';
import { glob } from 'glob';
import SourceMapSupport from 'source-map-support';
import { Logger } from '@/platform/api/Logger';
import {
  API_EXTENSION,
  API_URL_PATH,
  ENV_DEV,
  HTTP_DEFAULT_PREFIX,
  HTTP_INTERNAL_ERROR,
  HTTP_NOT_FOUND,
  PORT,
  SOURCE_DIR,
} from './constants';

const DEBUG = process.env.DEBUG === 'true';
const ENV = process.env.NODE_ENV || ENV_DEV;
const HTTP_PREFIX = process.env.HTTP_PREFIX || HTTP_DEFAULT_PREFIX;

export async function startServer(
  registerMiddlewares: (router: Router) => unknown,
): Promise<void> {
  Logger.info(`Starting portfolio server in ${ENV} mode...`);

  SourceMapSupport.install();

  const app = express();
  const httpServer = http.createServer(app);

  await new Promise<void>((resolve) => {
    httpServer.listen(PORT, resolve);
  });

  const mainRouter = express.Router();

  mainRouter.use((req, res, next) => {
    if (DEBUG) {
      Logger.info(`<- ${req.method} ${req.url}`);
    }
    if (ENV === ENV_DEV) {
      res.set('Access-Control-Allow-Origin', '*');
    }
    next();
  });

  const apiFiles = await glob(`${SOURCE_DIR}/**/*${API_EXTENSION}`);

  // await Promise.all(
  //   apiFiles.map(async (apiFile) => {
  //     console.log(apiFile);
  //     const { default: registerAPI } = await import(apiFile);
  //     const apiRouter = express.Router();
  //     const apiName = path.basename(apiFile, API_EXTENSION);
  //     registerAPI(apiRouter, httpServer);
  //     mainRouter.use(`${API_URL_PATH}/${apiName}`, apiRouter);
  //   }),
  // );

  registerMiddlewares(mainRouter);

  mainRouter.all('*', (_, res) => res.status(HTTP_NOT_FOUND).end());

  mainRouter.use(
    // next is required even if not used
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    (error: Error, req: Request, res: Response, next: NextFunction) => {
      Logger.error(error.stack as string);
      res.status(HTTP_INTERNAL_ERROR).end();
    },
  );

  app.use(HTTP_PREFIX, mainRouter);

  Logger.info(`Portfolio server started on http://localhost:${PORT}.`);
}
