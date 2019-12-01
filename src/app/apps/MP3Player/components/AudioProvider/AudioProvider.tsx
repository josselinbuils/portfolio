import React, { createContext, FC, useEffect, useState } from 'react';
import { useInjector } from '~/platform/hooks';
import { AudioController, AudioState } from './AudioController';

export const AudioContext = createContext<{
  audioController: AudioController | undefined;
  audioState: AudioState | undefined;
}>({
  audioController: undefined,
  audioState: undefined
});

export const AudioProvider: FC = ({ children }) => {
  const audioController = useInjector(AudioController);
  const [audioState, setAudioState] = useState<AudioState>();

  useEffect(() => {
    return audioController.audioStateSubject.subscribe(setAudioState);
  }, [audioController]);

  return (
    <AudioContext.Provider value={{ audioController, audioState }}>
      {children}
    </AudioContext.Provider>
  );
};
