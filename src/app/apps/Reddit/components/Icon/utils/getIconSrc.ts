import { getIn } from '@josselinbuils/utils';
import { getSubreddit } from '../../../utils';

export async function getIconSrc(
  subreddit: string
): Promise<string | undefined> {
  return getIn(await getSubreddit(subreddit), 'iconSrc');
}
