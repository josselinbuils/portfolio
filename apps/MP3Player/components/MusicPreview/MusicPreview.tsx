import { faMusic } from '@fortawesome/free-solid-svg-icons/faMusic';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cn from 'classnames';
import { FC } from 'react';
import { Music } from '../../interfaces/Music';

import styles from './MusicPreview.module.scss';

export const MusicPreview: FC<Props> = ({ music, size }) => {
  const useDefaultPreview = !music || !music.image;

  return (
    <div
      className={cn(styles.musicPreview, {
        [styles.defaultPreview]: useDefaultPreview,
      })}
      style={{
        backgroundImage: music && music.image ? `url(${music.image})` : 'none',
        fontSize: `${size / 10}rem`,
      }}
    >
      {useDefaultPreview && <FontAwesomeIcon icon={faMusic} />}
    </div>
  );
};

interface Props {
  music: Music | undefined;
  size: number;
}
