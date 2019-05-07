import { Router } from 'express';
import { asyncRoute } from '../../asyncRoute';
import { Logger } from '../../Logger';
import { JamendoController } from './JamendoController';

export function registerJamendoRoutes(router: Router) {
  Logger.info('Initializes jamendo routes');

  JamendoController.init();

  const handler = asyncRoute(JamendoController.getTracks);

  router.get('/api/jamendo/tracks/:order', handler);
  router.get('/api/jamendo/tracks/:tag/:order', handler);
}
