import dayjs from 'dayjs';

import { type Music } from '../../interfaces/Music';
import { type JamendoTrack } from '../interfaces/JamendoTrack';

const JAMENDO_BITRATES: Record<string, number> = {
  mp31: 96,
  mp32: 128,
  mp33: 320,
};

export function formatTracks(tracks: JamendoTrack[]): Music[] {
  return tracks.map((track) => ({
    albumName: track.album_name,
    artistName: track.artist_name,
    audio: track.audio,
    bitrateKbps: parseBitrateKbps(track.audio),
    duration: dayjs(track.duration * 1000).format('mm:ss'),
    id: track.id,
    image: track.image,
    name: track.name,
    waveform: JSON.parse(track.waveform),
  }));
}

function parseBitrateKbps(audioUrl: string): number | undefined {
  const match = audioUrl.match(/format=(mp3\d+)/);
  return match ? JAMENDO_BITRATES[match[1]] : undefined;
}
