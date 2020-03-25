import React, { FC } from 'react';
import { Music } from '~/apps/MP3Player/interfaces';

import styles from './MusicInfo.module.scss';

export const MusicInfo: FC<Props> = ({ music }) => (
  <div className={styles.musicInfo}>
    <div className={styles.name}>{music && music.name}</div>
    <div className={styles.artist}>{music && music.artist_name}</div>
  </div>
);

interface Props {
  music: Music | undefined;
}
