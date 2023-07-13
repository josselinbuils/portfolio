/* eslint-disable camelcase */
export interface JamendoTrack {
  album_id: string;
  album_image: string;
  album_name: string;
  artist_id: string;
  artist_idstr: string;
  artist_name: string;
  audio: string;
  audiodownload: string;
  duration: number;
  id: string;
  image: string;
  license_ccurl: string;
  musicinfo: {
    acousticelectric: string;
    gender: string;
    lang: string;
    speed: string;
    tags: {
      genres: string[];
      instruments: string[];
      vartags: string[];
    };
    vocalinstrumental: string;
  };
  name: string;
  position: number;
  prourl: string;
  readableDuration: string;
  releasedate: string;
  shareurl: string;
  shorturl: string;
  waveform: { peaks: number[] };
}
