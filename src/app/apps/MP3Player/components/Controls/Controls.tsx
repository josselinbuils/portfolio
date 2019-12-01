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
import React, { FC } from 'react';
import commonStyles from '../../common.module.scss';
import { useAudioController } from '../AudioProvider';
import { Button } from '../Button';
import styles from './Controls.module.scss';

export const Controls: FC<Props> = ({ className, size }) => {
  const { audioController } = useAudioController();

  if (audioController === undefined) {
    return null;
  }

  const {
    next,
    paused,
    play,
    prev,
    random,
    rand,
    repeat,
    toggleRepeat
  } = audioController;

  return (
    <div className={cn(styles.controls, className)} style={{ fontSize: size }}>
      <Button
        className={cn(styles.randomButton, {
          [commonStyles.checked]: random
        })}
        onClick={rand}
      >
        <FontAwesomeIcon icon={faRandom} />
      </Button>
      <Button className={cn(styles.previousButton)} onClick={prev}>
        <FontAwesomeIcon icon={faStepBackward} />
      </Button>
      <Button className={cn(styles.playButton)} onClick={play}>
        <FontAwesomeIcon icon={paused ? faPlayCircle : faPauseCircle} />
      </Button>
      <Button className={cn(styles.nextButton)} onClick={next}>
        <FontAwesomeIcon icon={faStepForward} />
      </Button>
      <Button
        className={cn(styles.repeatButton, {
          [commonStyles.checked]: repeat
        })}
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
