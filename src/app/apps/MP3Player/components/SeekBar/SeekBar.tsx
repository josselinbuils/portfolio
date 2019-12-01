import { faList } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { FC } from 'react';
import { Music } from '../../interfaces';
import { Button } from '../Button';
import { ProgressBar, ProgressBarProps } from './ProgressBar';
import styles from './SeekBar.module.scss';

export const SeekBar: FC<Props> = ({
  currentMusic,
  min = false,
  onClickTogglePlaylist,
  ...progressBarProps
}) => (
  <div className={styles.seekBar}>
    <time className={styles.currentTime}>00:00</time>
    <ProgressBar {...progressBarProps} />
    <time className={styles.duration}>
      {currentMusic ? currentMusic.readableDuration : '00:00'}
    </time>
    <Button
      checked={!min}
      className={styles.playlistButton}
      onClick={onClickTogglePlaylist}
    >
      <FontAwesomeIcon icon={faList} />
    </Button>
  </div>
);

interface Props extends ProgressBarProps {
  currentMusic: Music | undefined;
  min?: boolean;
  progress: number;
  onClickTogglePlaylist(): void;
}
