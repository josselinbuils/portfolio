import cn from 'classnames';
import { type FunctionComponent } from 'preact';

import { type MusicList } from '@/apps/MP3Player/interfaces/MusicList';
import { ButtonLink } from '@/platform/components/ButtonLink/ButtonLink';

import styles from './MenuItem.module.css';

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
    <ButtonLink
      className={cn(styles.item, { [styles.checked]: isActiveMusicList })}
      disabled={isActiveMusicList}
      onClick={() => onClickPlaylist(musicList)}
      role="menuitem"
    >
      {musicList.name}
    </ButtonLink>
  );
};
