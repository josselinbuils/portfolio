import cn from 'classnames';
import React, { FC } from 'react';
import commonStyles from '../../common.module.scss';
import { Music } from '../../interfaces';
import { ProgressBar, ProgressBarProps } from './ProgressBar';
import styles from './SeekBar.module.scss';

export const SeekBar: FC<Props> = ({
  currentMusic,
  min = false,
  onClickTogglePlaylist,
  ...progressBarProps
}) => (
  <div className={styles.seekBar}>
    <div className={styles.currentTime}>00:00</div>
    <ProgressBar {...progressBarProps} />
    <div className={styles.duration}>
      {currentMusic ? currentMusic.readableDuration : '00:00'}
    </div>
    <div
      className={cn(commonStyles.button, styles.playlistButton, {
        [commonStyles.checked]: !min
      })}
      onClick={onClickTogglePlaylist}
    >
      <i className="fas fa-list" />
    </div>
  </div>
);

interface Props extends ProgressBarProps {
  currentMusic?: Music;
  min?: boolean;
  progress: number;
  onClickTogglePlaylist(): void;
}
