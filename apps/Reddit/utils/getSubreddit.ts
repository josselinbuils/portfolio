import { getBaseURL } from '~/platform/utils/getBaseURL';
import type { Subreddit } from '../interfaces/Subreddit';

const subredditsWithoutIcon = ['r/popular'];

export async function getSubreddit(
  subreddit: string
): Promise<Subreddit | undefined> {
  if (!subredditsWithoutIcon.includes(subreddit)) {
    const response = await fetch(`${getBaseURL()}/api/Reddit/${subreddit}`);
    return response.json();
  }
}
