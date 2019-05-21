import cn from 'classnames';
import React, { FC } from 'react';
import commonStyles from '../common.module.scss';
import styles from './Controls.module.scss';

export const Controls: FC<Props> = ({
  min,
  onClickNext,
  onClickPlay,
  onClickPrevious,
  onClickRandom,
  onClickRepeat,
  paused,
  random,
  repeat
}) => (
  <div className={cn(styles.controls, { [styles.min]: min })}>
    <div
      className={cn(commonStyles.button, styles.randomButton, {
        [commonStyles.checked]: random
      })}
      onClick={onClickRandom}
    >
      <i className="fas fa-random" />
    </div>
    <div
      className={cn(commonStyles.button, styles.previousButton)}
      onClick={onClickPrevious}
    >
      <i className="fas fa-step-backward" />
    </div>
    <div
      className={cn(commonStyles.button, styles.playButton)}
      onClick={onClickPlay}
    >
      <i className={cn('fas', paused ? 'fa-play-circle' : 'fa-pause-circle')} />
    </div>
    <div
      className={cn(commonStyles.button, styles.nextButton)}
      onClick={onClickNext}
    >
      <i className="fas fa-step-forward" />
    </div>
    <div
      className={cn(commonStyles.button, styles.repeatButton, {
        [commonStyles.checked]: repeat
      })}
      onClick={onClickRepeat}
    >
      <i className="fas fa-repeat" />
    </div>
  </div>
);

interface Props {
  min: boolean;
  paused: boolean;
  random: boolean;
  repeat: boolean;
  onClickNext(): void;
  onClickPlay(): void;
  onClickPrevious(): void;
  onClickRandom(): void;
  onClickRepeat(): void;
}
