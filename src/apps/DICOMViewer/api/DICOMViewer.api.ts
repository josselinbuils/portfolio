import { type Router } from 'express';
import { asyncRoute } from '@/platform/api/asyncRoute';
import { getDataset } from './getDataset';
import { getList } from './getList';

export default (router: Router) => {
  router.get('/dataset/:dataset', getDataset);
  router.get('/list', asyncRoute(getList));
};
