import React, { FC, useContext } from 'react';
import { AudioContext } from '../../../AudioProvider';
import { Controls, MusicPreview, SeekBar } from '../../../index';
import styles from './Footer.module.scss';
import { MusicInfo } from './MusicInfo';

export const Footer: FC = () => {
  const { audioState } = useContext(AudioContext);

  if (audioState === undefined) {
    return null;
  }

  const { currentMusic } = audioState;

  return (
    <footer className={styles.footer}>
      <MusicPreview music={currentMusic} size={50} />
      <MusicInfo music={currentMusic} />
      <div className={styles.grow}>
        <Controls size={40} />
        <SeekBar
          currentMusic={currentMusic}
          progress={0}
          onClickTogglePlaylist={() => {}}
          onSeekStart={() => {}}
        />
      </div>
    </footer>
  );
};
