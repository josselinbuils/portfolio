import { Router } from 'express';
import { Logger } from '../../../Logger';
import { asyncRoute } from '../../asyncRoute';
import { RedditController } from './RedditController';

export function registerRedditRoutes(router: Router): void {
  Logger.info('Initializes reddit routes');

  const controller = new RedditController();

  router.get('/reddit/r/:subreddit', asyncRoute(controller.getSubreddit));
  router.get('/reddit/r/:subreddit/hot', asyncRoute(controller.getHot));
  router.get('/reddit/r/:subreddit/top', asyncRoute(controller.getTop));
}
