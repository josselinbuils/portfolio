const snoowrap = require('snoowrap');

const { reddit } = require('../../config.json');
const { HTTP_INTERNAL_ERROR, USER_AGENT } = require('../../constants.json');
const Logger = require('../../logger');

let redditAPI;

module.exports = class RedditController {
  static getHot(req, res) {
    const subreddit = req.params.subreddit;
    handle(res, redditAPI.getSubreddit(subreddit).getHot({ limit: 50 }));
  }

  static getTop(req, res) {
    const subreddit = req.params.subreddit;
    handle(res, redditAPI.getSubreddit(subreddit).getTop({ limit: 50 }));
  }

  static init() {
    validateConfig();

    redditAPI = new snoowrap({
      userAgent: USER_AGENT,
      clientId: reddit.clientId,
      clientSecret: reddit.clientSecret,
      username: reddit.username,
      password: reddit.password
    });
  }
};

function handle(res, promise) {
  promise.then(
    data => res.json(data),
    error => {
      Logger.error(error);
      res.status(HTTP_INTERNAL_ERROR).end();
    }
  );
}

function validateConfig() {
  if (
    !reddit ||
    [
      reddit.clientId,
      reddit.clientSecret,
      reddit.username,
      reddit.password
    ].some(field => !field)
  ) {
    throw Error('Invalid configuration: reddit');
  }
}
