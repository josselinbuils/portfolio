import cn from 'classnames';
import { FC, useContext } from 'react';
import { AudioContext } from '../AudioProvider/AudioProvider';
import { Controls } from '../Controls/Controls';
import { MusicPreview } from '../MusicPreview/MusicPreview';
import { SeekBar } from '../SeekBar/SeekBar';

import styles from './MiniPlayer.module.scss';

interface Props {
  onClickTogglePlaylist(): void;
}

export const MiniPlayer: FC<Props> = ({ onClickTogglePlaylist }) => {
  const { audioState } = useContext(AudioContext);

  if (audioState === undefined) {
    return null;
  }

  const { currentMusic } = audioState;

  return (
    <div className={cn(styles.miniPlayer, { [styles.hidden]: false })}>
      <div className={styles.header}>
        <Controls className={styles.controls} size={50} />
        <MusicPreview music={currentMusic} size={56} />
      </div>
      <div className={styles.musicInfo}>
        {currentMusic && (
          <span>
            {currentMusic.artistName} - {currentMusic.name}
          </span>
        )}
      </div>
      <SeekBar min onClickTogglePlaylist={onClickTogglePlaylist} />
    </div>
  );
};
