import { getIn } from '@josselinbuils/utils';
import { getSubreddit } from '../../../utils';

export async function getPreloadedIconSrc(
  subreddit: string
): Promise<string | undefined> {
  const iconSrc = getIn(await getSubreddit(subreddit), 'iconSrc');

  if (iconSrc === undefined) {
    return;
  }

  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(iconSrc);
    image.onerror = reject;
    image.src = iconSrc;
  });
}
