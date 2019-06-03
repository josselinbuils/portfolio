import { Request } from 'express';
import Snoowrap, { Subreddit as SnoowrapSubreddit } from 'snoowrap';
import { reddit } from '../../config';
import { RedditPost, Subreddit } from './interfaces';
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
  }

  getHot = async (req: Request): Promise<RedditPost[]> => {
    const posts = await this.snoowrap
      .getSubreddit(req.params.subreddit)
      .getHot();

    return formatPosts(posts);
  };

  getSubreddit = async (req: Request): Promise<Subreddit> => {
    const subreddit = (await (this.snoowrap
      .getSubreddit(req.params.subreddit)
      .fetch() as any)) as SnoowrapSubreddit;

    return {
      iconSrc: subreddit.icon_img || undefined
    };
  };

  getTop = async (req: Request): Promise<RedditPost[]> => {
    const posts = await this.snoowrap
      .getSubreddit(req.params.subreddit)
      .getTop({ time: 'all' });

    return formatPosts(posts);
  };
}
