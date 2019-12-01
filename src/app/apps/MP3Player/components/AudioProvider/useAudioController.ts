import { useContext } from 'react';
import { AudioController, AudioState } from './AudioController';
import { AudioContext } from './AudioProvider';

export function useAudioController(): {
  audioController: AudioController | undefined;
  audioState: AudioState | undefined;
} {
  return useContext(AudioContext);
}
