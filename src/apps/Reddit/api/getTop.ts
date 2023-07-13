import { type Request } from 'express';
import { type RedditPost } from '../interfaces/RedditPost';
import { formatPosts } from './utils/formatPosts';
import { getSnoowrapInstance } from './utils/getSnoowrapInstance';

export async function getTop(req: Request): Promise<RedditPost[]> {
  const posts = await getSnoowrapInstance()
    .getSubreddit(req.params.subreddit as string)
    .getTop({ time: 'all' });

  return formatPosts(posts);
}
