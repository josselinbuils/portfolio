import { getBaseURL } from '@/platform/utils/getBaseURL';
import { preloadImage } from '@/platform/utils/preloadImage';
import { type Music } from '../interfaces/Music';

export async function loadMusics(
  jamendoTag: string,
  jamendoOrder = 'popularity_total',
): Promise<Music[]> {
  const response = await fetch(
    `${getBaseURL()}/api/MP3Player/tracks?order=${jamendoOrder}${
      jamendoTag ? `&tag=${jamendoTag}` : ''
    }`,
  );
  const musics = (await response.json()) as Music[];
  await Promise.all(
    musics.slice(0, 10).map(({ image }) => preloadImage(image)),
  );
  return musics;
}
