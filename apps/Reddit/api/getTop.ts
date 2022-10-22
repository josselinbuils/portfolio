import type { NextApiRequest } from 'next';
import type { RedditPost } from '../interfaces/RedditPost';
import { formatPosts } from './utils/formatPosts';
import { getSnoowrapInstance } from './utils/getSnoowrapInstance';

export async function getTop(req: NextApiRequest): Promise<RedditPost[]> {
  const posts = await getSnoowrapInstance()
    .getSubreddit(req.query.subreddit as string)
    .getTop({ time: 'all' });

  return formatPosts(posts);
}
