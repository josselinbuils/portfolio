import React, { FC, useContext } from 'react';
import { AudioContext } from '~/apps/MP3Player/components/AudioProvider';
import { Controls } from '../../../Controls';
import { MusicPreview } from '../../../MusicPreview';
import { SeekBar } from '../../../SeekBar';
import { MusicInfo } from './MusicInfo';

import styles from './Footer.module.scss';

export const Footer: FC<Props> = ({ onClickTogglePlaylist }) => {
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
        <SeekBar onClickTogglePlaylist={onClickTogglePlaylist} />
      </div>
    </footer>
  );
};

interface Props {
  onClickTogglePlaylist(): void;
}