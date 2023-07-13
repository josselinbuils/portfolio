import cn from 'classnames';
import { type FC } from 'react';
import { type Music } from '@/apps/MP3Player/interfaces/Music';
import styles from './MusicInfo.module.scss';

interface Props {
  className?: string;
  music: Music | undefined;
}

export const MusicInfo: FC<Props> = ({ className, music }) => (
  <div className={cn(styles.musicInfo, className)}>
    <div className={styles.name}>{music?.name}</div>
    <div className={styles.artist}>{music?.artistName}</div>
  </div>
);
