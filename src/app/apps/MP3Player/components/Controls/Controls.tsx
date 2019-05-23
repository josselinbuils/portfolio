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
      <i className="fas fa-random" />
    </Button>
    <Button className={cn(styles.previousButton)} onClick={onClickPrevious}>
      <i className="fas fa-step-backward" />
    </Button>
    <Button className={cn(styles.playButton)} onClick={onClickPlay}>
      <i className={cn('fas', paused ? 'fa-play-circle' : 'fa-pause-circle')} />
    </Button>
    <Button className={cn(styles.nextButton)} onClick={onClickNext}>
      <i className="fas fa-step-forward" />
    </Button>
    <Button
      className={cn(styles.repeatButton, {
        [commonStyles.checked]: repeat
      })}
      onClick={onClickRepeat}
    >
      <i className="fas fa-redo-alt" />
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
