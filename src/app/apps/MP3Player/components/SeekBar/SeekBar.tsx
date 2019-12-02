import { faList } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import React, { FC, useContext } from 'react';
import { noop } from '~/platform/utils';
import { AudioContext } from '../../components/AudioProvider';
import { Button } from '../Button';
import { ProgressBar } from './ProgressBar';
import styles from './SeekBar.module.scss';

export const SeekBar: FC<Props> = ({ min = false, onClickTogglePlaylist }) => {
  const { audioController, audioState } = useContext(AudioContext);

  if (audioController === undefined || audioState === undefined) {
    return null;
  }

  const { currentMusic, currentTime, progress } = audioState;

  return (
    <div className={styles.seekBar}>
      <time className={styles.currentTime}>{currentTime}</time>
      <ProgressBar progress={progress} onSeekStart={noop} />
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
};

interface Props {
  min?: boolean;
  onClickTogglePlaylist(): void;
}
