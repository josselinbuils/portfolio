import { BASE_URL } from '~/platform/constants';
import { Subreddit } from '../interfaces/Subreddit';

const subredditsWithoutIcon = ['r/popular'];

export async function getSubreddit(
  subreddit: string
): Promise<Subreddit | undefined> {
  if (!subredditsWithoutIcon.includes(subreddit)) {
    const response = await fetch(`${BASE_URL}/api/reddit/${subreddit}`);
    return response.json();
  }
}
