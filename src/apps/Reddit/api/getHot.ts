import { type Request } from 'express';
import { type RedditPost } from '../interfaces/RedditPost';
import { formatPosts } from './utils/formatPosts';
import { getSnoowrapInstance } from './utils/getSnoowrapInstance';

export async function getHot(req: Request): Promise<RedditPost[]> {
  const posts = await getSnoowrapInstance()
    .getSubreddit(req.params.subreddit as string)
    .getHot();

  return formatPosts(posts);
}
