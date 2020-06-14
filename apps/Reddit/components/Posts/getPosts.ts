import { getBaseURL } from '~/platform/utils/getBaseURL';
import { RedditFilter } from '../../interfaces/RedditFilter';
import { RedditPost } from './RedditPost';

export async function getPosts(
  subreddit: string,
  filter: RedditFilter
): Promise<{
  posts: RedditPost[];
  subreddit: string;
}> {
  const response = await fetch(
    `${getBaseURL()}/api/reddit/${subreddit}/${filter}`
  );
  const posts = await response.json();
  return { posts, subreddit };
}
