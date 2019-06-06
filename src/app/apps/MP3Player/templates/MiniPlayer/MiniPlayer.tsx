import React, { FC } from 'react';
import { noop } from '~/platform/utils';
import commonStyles from '../../common.module.scss';
import { Controls, MusicPreview, SeekBar } from '../../components';
import { Music } from '../../interfaces';
import styles from './MiniPlayer.module.scss';

export const MiniPlayer: FC<Props> = ({ currentMusic }) => (
  <div className={commonStyles.player}>
    <div className={styles.header}>
      <Controls
        className={styles.controls}
        onClickNext={noop}
        onClickPlay={noop}
        onClickPrevious={noop}
        onClickRandom={noop}
        onClickRepeat={noop}
        paused={false}
        random={false}
        repeat={false}
        size={50}
      />
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

interface Props {
  currentMusic: Music | undefined;
}
