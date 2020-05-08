import { BASE_URL } from '~/platform/constants';
import { Music } from '../interfaces';

export async function loadMusics(
  jamendoTag: string,
  jamendoOrder: string = 'popularity_total'
): Promise<Music[]> {
  const restParameters = [jamendoTag, jamendoOrder].filter(Boolean).join('/');
  const response = await fetch(
    `${BASE_URL}/api/jamendo/tracks/${restParameters}`
  );
  return response.json();
}
