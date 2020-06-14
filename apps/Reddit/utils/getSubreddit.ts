import { getBaseURL } from '~/platform/utils/getBaseURL';
import { Subreddit } from '../interfaces/Subreddit';

const subredditsWithoutIcon = ['r/popular'];

export async function getSubreddit(
  subreddit: string
): Promise<Subreddit | undefined> {
  if (!subredditsWithoutIcon.includes(subreddit)) {
    const response = await fetch(`${getBaseURL()}/api/reddit/${subreddit}`);
    return response.json();
  }
}
