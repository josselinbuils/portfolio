import dayjs from 'dayjs';
import { BASE_URL } from '~/platform/constants';
import { Music } from '../interfaces';

export async function loadTracks(
  path: string,
  order: string = 'popularity_total'
): Promise<Music[]> {
  const response = await fetch(`${BASE_URL}/api/jamendo${path}/${order}`);
  const musicList = await response.json();

  musicList.forEach((music: any) => {
    music.readableDuration = dayjs(music.duration * 1000).format('mm:ss');
  });

  return musicList;
}
