import cn from 'classnames';
import { type FC, useContext } from 'preact/compat';
import { AudioContext } from '../AudioProvider/AudioProvider';
import { Controls } from '../Controls/Controls';
import { MusicPreview } from '../MusicPreview/MusicPreview';
import { SeekBar } from '../SeekBar/SeekBar';
import styles from './Footer.module.scss';
import { MusicInfo } from './MusicInfo';

export interface FooterProps {
  className?: string;
}

export const Footer: FC<FooterProps> = ({ className }) => {
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
        <SeekBar />
      </div>
    </footer>
  );
};
