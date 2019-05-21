import cn from 'classnames';
import React, { FC } from 'react';
import { Controls, SeekBar } from '~/apps/MP3Player/components';
import { noop } from '~/platform/utils';
import commonStyles from './common.module.scss';
import { Music } from './interfaces';
import styles from './MiniPlayer.module.scss';

export const MiniPlayer: FC<Props> = ({ currentMusic }) => {
  const useDefaultPreview = !currentMusic || !currentMusic.image;

  return (
    <div className={cn(commonStyles.player, styles.miniPlayer)}>
      <div className={styles.flex}>
        <div className={styles.left}>
          <Controls
            min
            onClickNext={noop}
            onClickPlay={noop}
            onClickPrevious={noop}
            onClickRandom={noop}
            onClickRepeat={noop}
            paused={false}
            random={false}
            repeat={false}
          />
        </div>
        <div
          className={cn(
            styles.musicPreview,
            useDefaultPreview && [
              commonStyles.defaultPreview,
              styles.defaultPreview,
              'fa fa-music'
            ]
          )}
          style={{
            backgroundImage: currentMusic
              ? `url(${currentMusic.image})`
              : 'none'
          }}
        />
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

interface Props {
  currentMusic?: Music;
}
