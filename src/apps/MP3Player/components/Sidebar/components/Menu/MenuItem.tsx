import cn from 'classnames';
import { type FunctionComponent } from 'preact';

import { type MusicList } from '@/apps/MP3Player/interfaces/MusicList';

import { Button } from '../../../Button/Button';
import classes from './MenuItem.module.css';

export type MenuItemProps = {
  activeMusicList: MusicList;
  musicList: MusicList;
  onClickPlaylist(musicList: MusicList): void;
};

export const MenuItem: FunctionComponent<MenuItemProps> = ({
  activeMusicList,
  musicList,
  onClickPlaylist,
}) => {
  const isActiveMusicList = musicList === activeMusicList;

  return (
    <Button
      className={cn(classes.item, { [classes.checked]: isActiveMusicList })}
      disabled={isActiveMusicList}
      onClick={() => onClickPlaylist(musicList)}
      role="menuitem"
    >
      {musicList.name}
    </Button>
  );
};
