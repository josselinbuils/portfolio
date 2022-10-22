import type { FC } from 'react';
import type { MusicList } from '~/apps/MP3Player/interfaces/MusicList';
import { musicLists } from '~/apps/MP3Player/musicLists';
import { MenuItem } from './MenuItem';

export interface MenuProps {
  activeMusicList: MusicList;
  onClickMusicList(playlist: MusicList): void;
}

export const Menu: FC<MenuProps> = ({ activeMusicList, onClickMusicList }) => (
  <nav>
    {musicLists.map((musicList) => (
      <MenuItem
        activeMusicList={activeMusicList}
        key={musicList.name}
        musicList={musicList}
        onClickPlaylist={onClickMusicList}
      />
    ))}
  </nav>
);
