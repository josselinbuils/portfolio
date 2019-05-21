import React, { FC, RefObject, useEffect } from 'react';
import styles from './Audio.module.scss';

export const Audio: FC<Props> = ({ audioRef, currentMusicSrc }, ref) => {
  useEffect(() => {
    if (audioRef.current !== null) {
      audioRef.current.load();
    }
  }, [audioRef, currentMusicSrc]);

  return (
    <audio className={styles.audio} ref={ref}>
      {currentMusicSrc && <source src={currentMusicSrc} type="audio/mp3" />}
    </audio>
  );
};

interface Props {
  currentMusicSrc?: string;
  audioRef: RefObject<HTMLAudioElement>;
}
