import React, { FC, useContext } from 'react';
import { noop } from '~/platform/utils';
import { AudioContext } from '../AudioProvider';
import { Controls, MusicPreview, SeekBar } from '../index';
import styles from './MiniPlayer.module.scss';

export const MiniPlayer: FC = () => {
  const { audioState } = useContext(AudioContext);

  if (audioState === undefined) {
    return null;
  }

  const { currentMusic } = audioState;

  return (
    <div className={styles.miniPlayer}>
      <div className={styles.header}>
        <Controls className={styles.controls} size={50} />
        <MusicPreview music={currentMusic} size={56} />
      </div>
      {currentMusic && (
        <div className={styles.musicInfo}>
          {currentMusic.artist_name}
          {currentMusic.name && <span> - {currentMusic.name}</span>}
        </div>
      )}
      <SeekBar min onClickTogglePlaylist={noop} />
    </div>
  );
};
