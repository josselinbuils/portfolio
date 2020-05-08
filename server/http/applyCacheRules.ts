import { Router } from 'express';
import { API_URL_PATH, ASSETS_URL_PATH } from './constants';

const cacheRules = [
  {
    path: ASSETS_URL_PATH,
    maxAge: 365 * 24 * 60 * 60,
  },
  {
    path: `/favicon`,
    maxAge: 7 * 24 * 60 * 60,
  },
  {
    path: `/static`,
    maxAge: 365 * 24 * 60 * 60,
  },
  {
    path: API_URL_PATH,
    maxAge: 5 * 60,
  },
];

export function applyCacheRules(router: Router): void {
  for (const { maxAge, path } of cacheRules) {
    router.use(path, (req, res, next) => {
      res.set('Cache-Control', `public, max-age=${maxAge}, immutable`);
      next();
    });
  }
}
