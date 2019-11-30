import {
  faCircle,
  faPauseCircle,
  faRandom,
  faRedoAlt,
  faStepBackward,
  faStepForward
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cn from 'classnames';
import React, { FC } from 'react';
import commonStyles from '../../common.module.scss';
import { Button } from '../Button';
import styles from './Controls.module.scss';

export const Controls: FC<Props> = ({
  className,
  onClickNext,
  onClickPlay,
  onClickPrevious,
  onClickRandom,
  onClickRepeat,
  paused,
  random,
  repeat,
  size
}) => (
  <div className={cn(styles.controls, className)} style={{ fontSize: size }}>
    <Button
      className={cn(styles.randomButton, {
        [commonStyles.checked]: random
      })}
      onClick={onClickRandom}
    >
      <FontAwesomeIcon icon={faRandom} />
    </Button>
    <Button className={cn(styles.previousButton)} onClick={onClickPrevious}>
      <FontAwesomeIcon icon={faStepBackward} />
    </Button>
    <Button className={cn(styles.playButton)} onClick={onClickPlay}>
      <FontAwesomeIcon icon={paused ? faCircle : faPauseCircle} />
    </Button>
    <Button className={cn(styles.nextButton)} onClick={onClickNext}>
      <FontAwesomeIcon icon={faStepForward} />
    </Button>
    <Button
      className={cn(styles.repeatButton, {
        [commonStyles.checked]: repeat
      })}
      onClick={onClickRepeat}
    >
      <FontAwesomeIcon icon={faRedoAlt} />
    </Button>
  </div>
);

interface Props {
  className?: string;
  paused: boolean;
  random: boolean;
  repeat: boolean;
  size: number;
  onClickNext(): void;
  onClickPlay(): void;
  onClickPrevious(): void;
  onClickRandom(): void;
  onClickRepeat(): void;
}
