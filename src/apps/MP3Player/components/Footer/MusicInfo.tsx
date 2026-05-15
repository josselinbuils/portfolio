import cn from 'classnames';
import { type FunctionComponent } from 'preact';

import { type Music } from '@/apps/MP3Player/interfaces/Music';

import classes from './MusicInfo.module.css';

export type MusicInfoProps = {
  className?: string;
  music: Music | undefined;
};

export const MusicInfo: FunctionComponent<MusicInfoProps> = ({
  className,
  music,
}) => (
  <div className={cn(classes.musicInfo, className)}>
    <div className={classes.name}>{music?.name}</div>
    <div className={classes.artist}>{music?.artistName}</div>
  </div>
);
