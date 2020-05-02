import { Router } from 'express';
import { Logger } from '../../../Logger';
import { asyncRoute } from '../../asyncRoute';
import { DicomController } from './DicomController';

export function registerDicomRoutes(router: Router): void {
  Logger.info('Initializes dicom routes');
  router.get('/api/dicom', asyncRoute(new DicomController().getList));
}
