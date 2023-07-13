import { type Router } from 'express';
import { asyncRoute } from '@/platform/api/asyncRoute';
import { getTracks } from './getTracks';

export default (router: Router) => {
  router.get('/tracks', asyncRoute(getTracks));
};
