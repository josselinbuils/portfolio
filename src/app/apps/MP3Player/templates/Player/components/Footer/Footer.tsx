import React, { FC } from 'react';
import { Controls, MusicPreview, SeekBar } from '../../../../components';
import { Music } from '../../../../interfaces';
import styles from './Footer.module.scss';
import { MusicInfo } from './MusicInfo';

export const Footer: FC<Props> = ({ currentMusic }) => (
  <footer className={styles.footer}>
    <MusicPreview music={currentMusic} size={56} />
    <MusicInfo music={currentMusic} />
    <div className={styles.grow}>
      <Controls
        paused={false}
        random={false}
        repeat={false}
        onClickNext={() => {}}
        onClickPlay={() => {}}
        onClickPrevious={() => {}}
        onClickRandom={() => {}}
        onClickRepeat={() => {}}
        size={40}
      />
      <SeekBar
        currentMusic={currentMusic}
        progress={0}
        onClickTogglePlaylist={() => {}}
        onSeekStart={() => {}}
      />
    </div>
  </footer>
);

interface Props {
  currentMusic: Music | undefined;
}
