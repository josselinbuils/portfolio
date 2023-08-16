import { faMusic } from '@fortawesome/free-solid-svg-icons/faMusic';
import cn from 'classnames';
import { type FC } from 'preact/compat';
import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';
import { type Music } from '../../interfaces/Music';
import styles from './MusicPreview.module.scss';

export interface MusicPreviewProps {
  music: Music | undefined;
  size: number;
}

export const MusicPreview: FC<MusicPreviewProps> = ({ music, size }) => {
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
