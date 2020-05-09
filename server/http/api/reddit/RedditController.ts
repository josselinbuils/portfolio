import { Request } from 'express';
import Snoowrap, { Subreddit as SnoowrapSubreddit } from 'snoowrap';
import { config } from '../../config';
import { RedditPost } from './interfaces/RedditPost';
import { Subreddit } from './interfaces/Subreddit';
import { formatPosts } from './utils/formatPosts';

const USER_AGENT = 'Portfolio by Josselin Buils';

export class RedditController {
  private readonly snoowrap: Snoowrap;

  constructor() {
    const { clientId, clientSecret, password, username } = config.reddit;

    this.snoowrap = new Snoowrap({
      userAgent: USER_AGENT,
      clientId,
      clientSecret,
      username,
      password,
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
      iconSrc: subreddit.icon_img || undefined,
    };
  };

  getTop = async (req: Request): Promise<RedditPost[]> => {
    const posts = await this.snoowrap
      .getSubreddit(req.params.subreddit)
      .getTop({ time: 'all' });

    return formatPosts(posts);
  };
}
