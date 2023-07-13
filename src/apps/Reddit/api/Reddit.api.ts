import { type Router } from 'express';
import { asyncRoute } from '@/platform/api/asyncRoute';
import { getHot } from './getHot';
import { getSubreddit } from './getSubreddit';
import { getTop } from './getTop';

export default (router: Router) => {
  router.get('/r/:subreddit', asyncRoute(getSubreddit));
  router.get('/r/:subreddit/hot', asyncRoute(getHot));
  router.get('/r/:subreddit/top', asyncRoute(getTop));
};
