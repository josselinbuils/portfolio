import http from 'node:http';
import express, {
  type NextFunction,
  type Request,
  type Response,
  type RequestHandler,
} from 'express';
import SourceMapSupport from 'source-map-support';
import registerCodeEditorAPI from '@/apps/CodeEditor/api/CodeEditor.api';
import registerDICOMViewerAPI from '@/apps/DICOMViewer/api/DICOMViewer.api';
import registerMP3PlayerAPI from '@/apps/MP3Player/api/MP3Player.api';
import registerRedditAPI from '@/apps/Reddit/api/Reddit.api';
import { Logger } from '@/platform/api/Logger';
import {
  API_URL_PATH,
  ENV_DEV,
  HTTP_DEFAULT_PREFIX,
  HTTP_INTERNAL_ERROR,
  HTTP_NOT_FOUND,
  PORT,
} from './constants';

const ENV = process.env.NODE_ENV || ENV_DEV;
const DEBUG = process.env.DEBUG === 'true';
const HTTP_PREFIX = process.env.HTTP_PREFIX || HTTP_DEFAULT_PREFIX;

export async function startServer(
  middlewares: RequestHandler[],
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

  const codeEditorAPIRouter = express.Router();
  await registerCodeEditorAPI(codeEditorAPIRouter, httpServer);
  mainRouter.use(`${API_URL_PATH}/CodeEditor`, codeEditorAPIRouter);

  const dicomViewerAPIRouter = express.Router();
  registerDICOMViewerAPI(dicomViewerAPIRouter);
  mainRouter.use(`${API_URL_PATH}/DICOMViewer`, dicomViewerAPIRouter);

  const mp3PlayerAPIRouter = express.Router();
  registerMP3PlayerAPI(mp3PlayerAPIRouter);
  mainRouter.use(`${API_URL_PATH}/MP3Player`, mp3PlayerAPIRouter);

  const redditAPIRouter = express.Router();
  registerRedditAPI(redditAPIRouter);
  mainRouter.use(`${API_URL_PATH}/Reddit`, redditAPIRouter);

  middlewares.forEach((middleware) => mainRouter.use(middleware));

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
