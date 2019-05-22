import React, { FC, RefObject, useEffect } from 'react';
import styles from './Audio.module.scss';

export const Audio: FC<Props> = ({ currentMusicSrc, innerRef }) => {
  useEffect(() => {
    if (innerRef.current !== null) {
      innerRef.current.load();
    }
  }, [currentMusicSrc, innerRef]);

  return (
    <audio className={styles.audio} ref={innerRef}>
      {currentMusicSrc && <source src={currentMusicSrc} type="audio/mp3" />}
    </audio>
  );
};

interface Props {
  currentMusicSrc?: string;
  // Use innerRef instead of forwardRef as it could provide a function as ref
  innerRef: RefObject<HTMLAudioElement>;
}
