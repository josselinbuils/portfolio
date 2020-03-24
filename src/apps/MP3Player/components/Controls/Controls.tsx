import {
  faPauseCircle,
  faPlayCircle,
  faRandom,
  faRedoAlt,
  faStepBackward,
  faStepForward
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cn from 'classnames';
import React, { FC, useContext } from 'react';
import { AudioContext } from '../AudioProvider';
import { Button } from '../Button';
import styles from './Controls.module.scss';

export const Controls: FC<Props> = ({ className, size }) => {
  const { audioController, audioState } = useContext(AudioContext);

  if (audioController === undefined || audioState === undefined) {
    return null;
  }

  const { next, play, prev, toggleRandom, toggleRepeat } = audioController;
  const { currentMusic, paused, random, repeat } = audioState;
  const isThereCurrentMusic = currentMusic !== undefined;

  return (
    <div
      className={cn(styles.controls, className)}
      style={{ fontSize: `${size / 10}rem` }}
    >
      <Button
        checked={random}
        className={styles.randomButton}
        onClick={toggleRandom}
      >
        <FontAwesomeIcon icon={faRandom} />
      </Button>
      <Button
        className={cn(styles.previousButton)}
        disabled={!isThereCurrentMusic}
        onClick={prev}
      >
        <FontAwesomeIcon icon={faStepBackward} />
      </Button>
      <Button
        className={cn(styles.playButton)}
        disabled={!isThereCurrentMusic}
        onClick={play}
      >
        <FontAwesomeIcon icon={paused ? faPlayCircle : faPauseCircle} />
      </Button>
      <Button
        className={cn(styles.nextButton)}
        disabled={!isThereCurrentMusic}
        onClick={next}
      >
        <FontAwesomeIcon icon={faStepForward} />
      </Button>
      <Button
        checked={repeat}
        className={styles.repeatButton}
        onClick={toggleRepeat}
      >
        <FontAwesomeIcon icon={faRedoAlt} />
      </Button>
    </div>
  );
};

interface Props {
  className?: string;
  size: number;
}
