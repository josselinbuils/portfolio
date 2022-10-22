import type { NextApiRequest } from 'next';
import type { RedditPost } from '../interfaces/RedditPost';
import { formatPosts } from './utils/formatPosts';
import { getSnoowrapInstance } from './utils/getSnoowrapInstance';

export async function getHot(req: NextApiRequest): Promise<RedditPost[]> {
  const posts = await getSnoowrapInstance()
    .getSubreddit(req.query.subreddit as string)
    .getHot();

  return formatPosts(posts);
}
