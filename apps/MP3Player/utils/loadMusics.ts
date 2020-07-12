import { getBaseURL } from '~/platform/utils/getBaseURL';
import { Music } from '../interfaces/Music';

export async function loadMusics(
  jamendoTag: string,
  jamendoOrder = 'popularity_total'
): Promise<Music[]> {
  const response = await fetch(
    `${getBaseURL()}/api/MP3Player/tracks?order=${jamendoOrder}${
      jamendoTag ? `&tag=${jamendoTag}` : ''
    }`
  );
  return response.json();
}
