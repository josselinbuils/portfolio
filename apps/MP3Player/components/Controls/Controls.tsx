import { faPauseCircle } from '@fortawesome/free-solid-svg-icons/faPauseCircle';
import { faPlayCircle } from '@fortawesome/free-solid-svg-icons/faPlayCircle';
import { faRandom } from '@fortawesome/free-solid-svg-icons/faRandom';
import { faRedoAlt } from '@fortawesome/free-solid-svg-icons/faRedoAlt';
import { faStepBackward } from '@fortawesome/free-solid-svg-icons/faStepBackward';
import { faStepForward } from '@fortawesome/free-solid-svg-icons/faStepForward';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cn from 'classnames';
import { FC, useContext } from 'react';
import { AudioContext } from '../AudioProvider/AudioProvider';
import { Button } from '../Button/Button';
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
        className={styles.previousButton}
        disabled={!isThereCurrentMusic}
        onClick={prev}
      >
        <FontAwesomeIcon icon={faStepBackward} />
      </Button>
      <Button
        className={styles.playButton}
        disabled={!isThereCurrentMusic}
        onClick={play}
      >
        <FontAwesomeIcon icon={paused ? faPlayCircle : faPauseCircle} />
      </Button>
      <Button
        className={styles.nextButton}
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
