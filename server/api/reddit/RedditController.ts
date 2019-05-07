import { Request } from 'express';
import Snoowrap from 'snoowrap';
import { reddit } from '../../config.json';
import { RedditPost } from './RedditPost';
import { isRedditConfig } from './RedditConfig';
import { formatPosts } from './utils';

const USER_AGENT = 'Portfolio by Josselin Buils';

export class RedditController {
  snoowrap: Snoowrap;

  constructor() {
    if (!isRedditConfig(reddit)) {
      console.log(reddit);
      throw Error('Invalid configuration: reddit');
    }

    const { clientId, clientSecret, password, username } = reddit;

    this.snoowrap = new Snoowrap({
      userAgent: USER_AGENT,
      clientId,
      clientSecret,
      username,
      password
    });

    // this.snoowrap
    //   .getSubreddit('r/javascript')
    //   .fetch()
    //   .then(console.log.bind(console));
  }

  getHot = async (req: Request): Promise<RedditPost[]> => {
    const posts = await this.snoowrap
      .getSubreddit(req.params.subreddit)
      .getHot();

    return formatPosts(posts);
  };

  getTop = async (req: Request): Promise<RedditPost[]> => {
    const posts = await this.snoowrap
      .getSubreddit(req.params.subreddit)
      .getTop({ time: 'all' });

    return formatPosts(posts);
  };
}
