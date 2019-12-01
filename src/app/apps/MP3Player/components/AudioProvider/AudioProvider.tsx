import React, { createContext, FC, useEffect, useState } from 'react';
import { AudioController, AudioState } from './AudioController';
import styles from './AudioProvider.module.scss';

export const AudioContext = createContext<{
  audioController: AudioController | undefined;
  audioState: AudioState | undefined;
}>({
  audioController: undefined,
  audioState: undefined
});

export const AudioProvider: FC = ({ children }) => {
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );
  const [audioController, setAudioController] = useState<AudioController>();
  const [audioState, setAudioState] = useState<AudioState>();
  const currentMusic = audioState && audioState.currentMusic;

  useEffect(() => {
    if (audioElement !== null && currentMusic !== undefined) {
      audioElement.load();
    }
  }, [audioElement, currentMusic]);

  useEffect(() => {
    if (audioElement !== null) {
      setAudioController(new AudioController(audioElement));
    }
  }, [audioElement]);

  useEffect(() => {
    if (audioController !== undefined) {
      const unsubscribe = audioController.audioStateSubject.subscribe(
        setAudioState
      );

      return () => {
        unsubscribe();
        audioController.destroy();
      };
    }
  }, [audioController]);

  return (
    <>
      <AudioContext.Provider value={{ audioController, audioState }}>
        {children}
      </AudioContext.Provider>
      <audio className={styles.audio} ref={setAudioElement}>
        {currentMusic && <source src={currentMusic.audio} type="audio/mp3" />}
      </audio>
    </>
  );
};
