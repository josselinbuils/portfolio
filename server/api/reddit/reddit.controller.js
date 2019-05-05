const dayjs = require('dayjs');
const relativeTime = require('dayjs/plugin/relativeTime');
const snoowrap = require('snoowrap');

const { reddit } = require('../../config.json');
const { HTTP_INTERNAL_ERROR, USER_AGENT } = require('../../constants.json');
const Logger = require('../../logger');

dayjs.extend(relativeTime);

let redditAPI;

module.exports = class RedditController {
  static getHot(req, res) {
    const subreddit = req.params.subreddit;
    handle(res, redditAPI.getSubreddit(subreddit).getHot());
  }

  static getTop(req, res) {
    const subreddit = req.params.subreddit;
    handle(res, redditAPI.getSubreddit(subreddit).getTop({ time: 'all' }));
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
    posts => {
      res.json(
        posts.map(post => ({
          author: post.author.name,
          domain: post.domain,
          numComments: post.num_comments,
          permalink: post.permalink,
          previewUrl: getIn(post.preview, 'images[0].resolutions[1].url'),
          score: post.score,
          since: dayjs(post.created_utc * 1000).fromNow(),
          stickied: post.stickied,
          title: post.title,
          url: post.url
        }))
      );
    },
    error => {
      Logger.error(error);
      res.status(HTTP_INTERNAL_ERROR).end();
    }
  );
}

function getIn(obj, key, defaultValue) {
  const path = toPath(key);

  for (let i = 0; obj && i < path.length; i++) {
    obj = obj[path[i]];
  }

  return obj !== undefined ? obj : defaultValue;
}

function toPath(key) {
  const matches = key.match(/[^.[\]]+/g);

  if (matches === null) {
    throw new Error('Invalid key');
  }

  return matches.map(match => {
    const number = Number(match);
    return Number.isNaN(number) ? match : number;
  });
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
