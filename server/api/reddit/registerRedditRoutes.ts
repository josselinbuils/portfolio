import { Router } from 'express';
import { asyncRoute } from '../../asyncRoute';
import { Logger } from '../../Logger';
import { RedditController } from './RedditController';

export function registerRedditRoutes(router: Router): void {
  Logger.info('Initializes reddit routes');

  const controller = new RedditController();

  router.get('/api/reddit/r/:subreddit', asyncRoute(controller.getSubreddit));
  router.get('/api/reddit/r/:subreddit/hot', asyncRoute(controller.getHot));
  router.get('/api/reddit/r/:subreddit/top', asyncRoute(controller.getTop));
}
