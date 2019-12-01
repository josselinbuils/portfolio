import React, { FC } from 'react';
import { Music } from '../../interfaces';
import styles from './MusicInfo.module.scss';

export const MusicInfo: FC<Props> = ({ music }) =>
  music ? (
    <div className={styles.musicInfo}>
      <div className={styles.name}>{music.name}</div>
      <div className={styles.artist}>{music.artist_name}</div>
    </div>
  ) : null;

interface Props {
  music: Music | undefined;
}
