import cn from 'classnames';
import React, { FC } from 'react';
import commonStyles from '../../common.module.scss';
import { Music } from '../../interfaces';
import styles from './MusicPreview.module.scss';

export const MusicPreview: FC<Props> = ({ music, size }) => {
  const useDefaultPreview = !music || !music.image;

  return (
    <div
      className={cn(
        styles.musicPreview,
        useDefaultPreview && [
          commonStyles.defaultPreview,
          styles.defaultPreview,
          'fa fa-music'
        ]
      )}
      style={{
        backgroundImage: music ? `url(${music.image})` : 'none',
        fontSize: size
      }}
    />
  );
};

interface Props {
  music: Music | undefined;
  size: number;
}
