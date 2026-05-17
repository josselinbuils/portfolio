import { faPause } from '@fortawesome/free-solid-svg-icons/faPause';
import { faPlay } from '@fortawesome/free-solid-svg-icons/faPlay';
import { faRandom } from '@fortawesome/free-solid-svg-icons/faRandom';
import { faRedoAlt } from '@fortawesome/free-solid-svg-icons/faRedoAlt';
import { faStepBackward } from '@fortawesome/free-solid-svg-icons/faStepBackward';
import { faStepForward } from '@fortawesome/free-solid-svg-icons/faStepForward';
import cn from 'classnames';
import { type FunctionComponent } from 'preact';
import { useContext } from 'preact/hooks';

import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';

import { AudioContext } from '../AudioProvider/AudioProvider';
import { Button } from '../Button/Button';
import classes from './Controls.module.css';

export type ControlsProps = {
  className?: string;
  size: number;
};

export const Controls: FunctionComponent<ControlsProps> = ({
  className,
  size,
}) => {
  const { audioController, audioState } = useContext(AudioContext);

  if (audioController === undefined || audioState === undefined) {
    return null;
  }

  const { next, play, prev, toggleRandom, toggleRepeat } = audioController;
  const { currentMusic, paused, random, repeat } = audioState;
  const isThereCurrentMusic = currentMusic !== undefined;

  return (
    <div
      className={cn(classes.controls, className)}
      style={{ fontSize: `${size / 10}rem` }}
    >
      <Button
        checked={random}
        className={classes.randomButton}
        onClick={toggleRandom}
      >
        <FontAwesomeIcon icon={faRandom} />
      </Button>
      <Button
        className={classes.previousButton}
        disabled={!isThereCurrentMusic}
        onClick={prev}
      >
        <FontAwesomeIcon icon={faStepBackward} />
      </Button>
      <Button
        className={classes.playButton}
        disabled={!isThereCurrentMusic}
        onClick={play}
      >
        <FontAwesomeIcon icon={paused ? faPlay : faPause} />
      </Button>
      <Button
        className={classes.nextButton}
        disabled={!isThereCurrentMusic}
        onClick={next}
      >
        <FontAwesomeIcon icon={faStepForward} />
      </Button>
      <Button
        checked={repeat}
        className={classes.repeatButton}
        onClick={toggleRepeat}
      >
        <FontAwesomeIcon icon={faRedoAlt} />
      </Button>
    </div>
  );
};
