import React, { FC } from 'react';
import { Playlist } from '../../../../interfaces';
import { playlists } from '../../../../playlists';
import { MenuItem } from './MenuItem';

export const Menu: FC<Props> = ({ activePlaylist, onClickPlaylist }) => (
  <nav>
    {playlists.map(playlist => (
      <MenuItem
        activePlaylist={activePlaylist}
        key={playlist.path}
        onClickPlaylist={onClickPlaylist}
        playlist={playlist}
      />
    ))}
  </nav>
);

interface Props {
  activePlaylist: Playlist;
  onClickPlaylist(playlist: Playlist): void;
}
