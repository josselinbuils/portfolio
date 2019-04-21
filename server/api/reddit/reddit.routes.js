const Logger = require('../../logger');
const RedditController = require('./reddit.controller');

module.exports = class RedditRoutes {
  static init(router) {
    Logger.info('Initializes reddit routes');
    RedditController.init();
    router.get('/api/reddit/r/:subreddit/hot', RedditController.getHot);
    router.get('/api/reddit/r/:subreddit/top', RedditController.getTop);
  }
};
