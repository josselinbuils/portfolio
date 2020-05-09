import { Router } from 'express';
import { Logger } from '../../../Logger';
import { asyncRoute } from '../../asyncRoute';
import { getTracks } from './requestHandlers/getTracks';

export function registerJamendoRoutes(router: Router): void {
  Logger.info('Initializes jamendo routes');

  const handler = asyncRoute(getTracks);

  router.get('/jamendo/tracks/:order', handler);
  router.get('/jamendo/tracks/:tag/:order', handler);
}
