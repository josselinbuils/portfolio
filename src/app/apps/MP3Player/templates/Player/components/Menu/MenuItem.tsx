import cn from 'classnames';
import React, { FC } from 'react';
import { Playlist } from '~/apps/MP3Player/interfaces';
import commonStyles from '../../../../common.module.scss';
import styles from './MenuItem.module.scss';

export const MenuItem: FC<Props> = ({
  activePlaylist,
  onClickPlaylist,
  playlist
}) => {
  const isActivePlaylist = playlist === activePlaylist;

  return (
    <button
      className={cn(commonStyles.buttonLink, styles.item, {
        [styles.active]: isActivePlaylist
      })}
      disabled={isActivePlaylist}
      onClick={() => onClickPlaylist(playlist)}
    >
      {playlist.name}
    </button>
  );
};

interface Props {
  activePlaylist: Playlist;
  playlist: Playlist;
  onClickPlaylist(playlist: Playlist): void;
}
