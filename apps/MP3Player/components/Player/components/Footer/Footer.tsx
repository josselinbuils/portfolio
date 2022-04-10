import cn from 'classnames';
import { FC, useContext } from 'react';
import { AudioContext } from '../../../AudioProvider/AudioProvider';
import { Controls } from '../../../Controls/Controls';
import { MusicPreview } from '../../../MusicPreview/MusicPreview';
import { SeekBar } from '../../../SeekBar/SeekBar';
import { MusicInfo } from './MusicInfo';

import styles from './Footer.module.scss';

interface Props {
  className?: string;
  onClickTogglePlaylist(): void;
}

export const Footer: FC<Props> = ({ className, onClickTogglePlaylist }) => {
  const { audioState } = useContext(AudioContext);

  if (audioState === undefined) {
    return null;
  }

  const { currentMusic } = audioState;

  return (
    <footer className={cn(styles.footer, className)}>
      <MusicPreview music={currentMusic} size={50} />
      <MusicInfo className={styles.musicInfo} music={currentMusic} />
      <div className={styles.grow}>
        <Controls size={40} />
        <SeekBar onClickTogglePlaylist={onClickTogglePlaylist} />
      </div>
    </footer>
  );
};
