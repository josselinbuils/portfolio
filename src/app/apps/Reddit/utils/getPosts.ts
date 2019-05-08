import { BASE_URL } from '~/platform/constants';
import { RedditFilter, RedditPost } from '../interfaces';

export async function getPosts(
  subreddit: string,
  filter: RedditFilter
): Promise<RedditPost[]> {
  const response = await fetch(`${BASE_URL}/api/reddit/${subreddit}/${filter}`);
  return response.json();
}
