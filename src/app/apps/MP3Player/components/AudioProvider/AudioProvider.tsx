import React, { createContext, FC, useEffect, useState } from 'react';
import { AudioController } from './AudioController';
import styles from './AudioProvider.module.scss';

export const AudioContext = createContext<{
  audioController: AudioController | undefined;
}>({ audioController: undefined });

export const AudioProvider: FC = ({ children }) => {
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(
    null
  );
  const [audioController, setAudioController] = useState<AudioController>();
  const [currentMusicSrc, setCurrentMusicSrc] = useState<string>();

  useEffect(() => {
    if (audioElement !== null && currentMusicSrc !== undefined) {
      audioElement.load();
    }
  }, [audioElement, currentMusicSrc]);

  useEffect(() => {
    if (audioElement !== null) {
      setAudioController(new AudioController(audioElement));
    }
  }, [audioElement]);

  useEffect(() => {
    if (audioController !== undefined) {
      const unsubscribe = audioController.currentMusicSubject.subscribe(music =>
        setCurrentMusicSrc(music.audio)
      );

      return () => {
        unsubscribe();
        audioController.destroy();
      };
    }
  }, [audioController, setCurrentMusicSrc]);

  return (
    <>
      <AudioContext.Provider value={{ audioController }}>
        {children}
      </AudioContext.Provider>
      <audio className={styles.audio} ref={setAudioElement}>
        {currentMusicSrc && <source src={currentMusicSrc} type="audio/mp3" />}
      </audio>
    </>
  );
};
