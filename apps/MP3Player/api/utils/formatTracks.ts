import dayjs from 'dayjs';
import type { Music } from '../../interfaces/Music';
import type { JamendoTrack } from '../interfaces/JamendoTrack';

export function formatTracks(tracks: JamendoTrack[]): Music[] {
  return tracks.map((track) => ({
    albumName: track.album_name,
    artistName: track.artist_name,
    audio: track.audio,
    duration: dayjs(track.duration * 1000).format('mm:ss'),
    id: track.id,
    image: track.image,
    name: track.name,
  }));
}
