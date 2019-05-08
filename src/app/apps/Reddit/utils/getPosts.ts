import { BASE_URL } from '~/platform/constants';
import { RedditFilter, RedditPostMap } from '../interfaces';

export async function getPosts(
  subreddit: string,
  filter: RedditFilter
): Promise<RedditPostMap> {
  const response = await fetch(`${BASE_URL}/api/reddit/${subreddit}/${filter}`);
  const posts = await response.json();
  return { posts, subreddit };
}
