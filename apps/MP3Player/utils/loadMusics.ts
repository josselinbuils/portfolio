import { BASE_URL } from '~/platform/constants';
import { Music } from '../interfaces/Music';

export async function loadMusics(
  jamendoTag: string,
  jamendoOrder: string = 'popularity_total'
): Promise<Music[]> {
  const response = await fetch(
    `${BASE_URL}/api/jamendo/tracks?order=${jamendoOrder}${jamendoTag ? `&tag=${jamendoTag}` : ''}`
  );
  return response.json();
}
