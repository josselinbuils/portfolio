import { FC, useContext } from 'react';
import { AudioContext } from '~/apps/MP3Player/components/AudioProvider/AudioProvider';
import { Controls } from '../../../Controls/Controls';
import { MusicPreview } from '../../../MusicPreview/MusicPreview';
import { SeekBar } from '../../../SeekBar/SeekBar';
import { MusicInfo } from './MusicInfo';

import styles from './Footer.module.scss';

export const Footer: FC<Props> = ({ onClickTogglePlaylist }) => {
  const { audioState } = useContext(AudioContext);

  if (audioState === undefined) {
    return null;
  }

  const { currentMusic } = audioState;

  return (
    <footer className={styles.footer}>
      <MusicPreview music={currentMusic} size={50} />
      <MusicInfo music={currentMusic} />
      <div className={styles.grow}>
        <Controls size={40} />
        <SeekBar onClickTogglePlaylist={onClickTogglePlaylist} />
      </div>
    </footer>
  );
};

interface Props {
  onClickTogglePlaylist(): void;
}
