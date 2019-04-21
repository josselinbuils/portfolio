const bodyParser = require('body-parser');
const express = require('express');
const { existsSync } = require('fs');
const { join } = require('path');
const serveStatic = require('serve-static');

const {
  ASSETS_DIR,
  ASSETS_DIR_DEV,
  ENV_DEV,
  HTTP_DEFAULT_PREFIX,
  HTTP_INTERNAL_ERROR,
  HTTP_NOT_FOUND,
  MAX_AGE_DAYS,
  PUBLIC_DIR,
} = require('./constants.json');
const DependenciesRoutes = require('./api/dependencies/dependencies.routes');
const DicomRoutes = require('./api/dicom/dicom.routes');
const JamendoRoutes = require('./api/jamendo/jamendo.routes');
const Logger = require('./logger');
const RedditRoutes = require('./api/reddit/reddit.routes');

const ENV = process.env.NODE_ENV || ENV_DEV;
const ASSETS_PATH = join(
  process.cwd(),
  ENV === ENV_DEV ? ASSETS_DIR_DEV : ASSETS_DIR,
);
const CLIENT_PATH = join(process.cwd(), PUBLIC_DIR);
const HTTP_PREFIX = process.env.HTTP_PREFIX || HTTP_DEFAULT_PREFIX;

module.exports = class Router {
  static init(app) {
    Logger.info('Initializes router');

    const router = express.Router();

    router.use((req, res, next) => {
      Logger.info(`<- ${req.method} ${req.url}`);

      if (ENV === ENV_DEV) {
        res.set('Access-Control-Allow-Origin', '*');
        res.set(
          'Access-Control-Allow-Headers',
          'Origin, X-Requested-With, Content-Type, Accept',
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

    router.use(
      ASSETS_DIR,
      serveStatic(ASSETS_PATH, {
        immutable: true,
        maxAge: MAX_AGE_DAYS * 24 * 60 * 60 * 1000,
      }),
    );
    router.use(serveStatic(CLIENT_PATH));
    router.use(bodyParser.json());

    DependenciesRoutes.init(router);
    DicomRoutes.init(router);
    JamendoRoutes.init(router);
    RedditRoutes.init(router);

    router.get('*', (req, res) => res.status(HTTP_NOT_FOUND).end());

    // next is required even if not used
    // noinspection JSUnusedLocalSymbols
    router.use((error, req, res, next) => {
      Logger.error(error.stack);
      res.status(HTTP_INTERNAL_ERROR).end();
    });

    app.use(HTTP_PREFIX, router);
  }
};
