export type Music = {
  albumName: string;
  artistName: string;
  audio: string;
  bitrateKbps: number | undefined;
  duration: string;
  id: string;
  image: string;
  name: string;
  waveform: { peaks: number[] };
};
