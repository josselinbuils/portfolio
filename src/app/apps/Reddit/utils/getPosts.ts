import { BASE_URL } from '~/platform/constants';
import { RedditFilter } from '../interfaces';

export async function getPosts(subreddit: string, filter: RedditFilter) {
  const response = await fetch(`${BASE_URL}/api/reddit/${subreddit}/${filter}`);
  return response.json();
}
