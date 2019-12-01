import React, { FC, useContext } from 'react';
import { noop } from '~/platform/utils';
import commonStyles from './common.module.scss';
import { Controls, MusicPreview, SeekBar } from './components';
import { AudioContext } from './components/AudioProvider';
import styles from './MiniPlayer.module.scss';

export const MiniPlayer: FC = () => {
  const { audioState } = useContext(AudioContext);

  if (audioState === undefined) {
    return null;
  }

  const { currentMusic } = audioState;

  return (
    <div className={commonStyles.player}>
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
      <SeekBar
        currentMusic={currentMusic}
        min
        onClickTogglePlaylist={noop}
        onSeekStart={noop}
        progress={0}
      />
    </div>
  );
};
