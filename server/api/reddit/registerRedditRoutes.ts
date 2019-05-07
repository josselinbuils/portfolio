import { Router } from 'express';
import { Logger } from '../../Logger';
import { RedditController } from './RedditController';
import { asyncRoute } from '../../asyncRoute';

export function registerRedditRoutes(router: Router) {
  Logger.info('Initializes reddit routes');

  const controller = new RedditController();

  router.get('/api/reddit/r/:subreddit/hot', asyncRoute(controller.getHot));
  // router.get('/api/reddit/r/:subreddit/icon', asyncRoute(controller.getIcon));
  router.get('/api/reddit/r/:subreddit/top', asyncRoute(controller.getTop));
}
