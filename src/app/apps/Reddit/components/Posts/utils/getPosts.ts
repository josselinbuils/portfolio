import { BASE_URL } from '~/platform/constants';
import { RedditFilter } from '../../../interfaces';
import { RedditPost } from '../RedditPost';

export async function getPosts(
  subreddit: string,
  filter: RedditFilter
): Promise<{
  posts: RedditPost[];
  subreddit: string;
}> {
  const response = await fetch(`${BASE_URL}/api/reddit/${subreddit}/${filter}`);
  const posts = await response.json();
  return { posts, subreddit };
}
