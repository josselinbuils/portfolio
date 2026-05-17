import cn from 'classnames';
import { type FunctionComponent } from 'preact';

import { type Music } from '@/apps/MP3Player/interfaces/Music';

import classes from './MusicInfo.module.css';

export type MusicInfoProps = {
  className?: string;
  music: Music | undefined;
  paused: boolean;
};

export const MusicInfo: FunctionComponent<MusicInfoProps> = ({
  className,
  music,
  paused,
}) => {
  const text = music
    ? `${music.name} — ${music.artistName}`
    : ' Royalty-free radio · powered by Jamendo';

  return (
    <div
      className={cn(classes.musicInfo, className, {
        [classes.paused]: paused,
      })}
    >
      <div className={classes.scroll}>
        <span className={classes.segment}>{text}</span>
        <span aria-hidden="true" className={classes.segment}>
          {text}
        </span>
        <span aria-hidden="true" className={classes.segment}>
          {text}
        </span>
        <span aria-hidden="true" className={classes.segment}>
          {text}
        </span>
        <span aria-hidden="true" className={classes.segment}>
          {text}
        </span>
        <span aria-hidden="true" className={classes.segment}>
          {text}
        </span>
      </div>
    </div>
  );
};
