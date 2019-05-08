import { BASE_URL } from '~/platform/constants';
import { Subreddit } from '../interfaces';

const blackList = ['r/popular'];
const cache: { [subreddit: string]: Subreddit } = {};

export async function getSubreddit(
  subreddit: string
): Promise<Subreddit | undefined> {
  if (!blackList.includes(subreddit) && cache[subreddit] === undefined) {
    const response = await fetch(`${BASE_URL}/api/reddit/${subreddit}`);
    cache[subreddit] = await response.json();
  }
  return cache[subreddit];
}
