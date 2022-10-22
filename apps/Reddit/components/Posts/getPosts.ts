import { getBaseURL } from '~/platform/utils/getBaseURL';
import type { RedditFilter } from '../../interfaces/RedditFilter';
import type { RedditPost } from '../../interfaces/RedditPost';

export async function getPosts(
  subreddit: string,
  filter: RedditFilter
): Promise<{
  posts: RedditPost[];
  subreddit: string;
}> {
  const response = await fetch(
    `${getBaseURL()}/api/Reddit/${subreddit}/${filter}`
  );
  const posts = await response.json();
  return { posts, subreddit };
}
