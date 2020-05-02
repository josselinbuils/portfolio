import { Router } from 'express';
import { Logger } from '../../../Logger';
import { asyncRoute } from '../../asyncRoute';
import { JamendoController } from './JamendoController';

export function registerJamendoRoutes(router: Router): void {
  Logger.info('Initializes jamendo routes');

  JamendoController.init();

  const handler = asyncRoute(JamendoController.getTracks);

  router.get('/api/jamendo/tracks/:order', handler);
  router.get('/api/jamendo/tracks/:tag/:order', handler);
}
