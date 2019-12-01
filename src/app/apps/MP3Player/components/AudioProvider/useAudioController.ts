import { useContext } from 'react';
import { AudioController } from './AudioController';
import { AudioContext } from './AudioProvider';

export function useAudioController(): {
  audioController: AudioController | undefined;
} {
  return useContext(AudioContext);
}
