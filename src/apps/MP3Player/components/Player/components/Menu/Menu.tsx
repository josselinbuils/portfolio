import React, { FC } from 'react';
import { MusicList } from '~/apps/MP3Player/interfaces';
import { musicLists } from '~/apps/MP3Player/musicLists';
import { MenuItem } from './MenuItem';

export const Menu: FC<Props> = ({ activeMusicList, onClickMusicList }) => (
  <nav>
    {musicLists.map(musicList => (
      <MenuItem
        activeMusicList={activeMusicList}
        key={musicList.path}
        musicList={musicList}
        onClickPlaylist={onClickMusicList}
      />
    ))}
  </nav>
);

interface Props {
  activeMusicList: MusicList;
  onClickMusicList(playlist: MusicList): void;
}
