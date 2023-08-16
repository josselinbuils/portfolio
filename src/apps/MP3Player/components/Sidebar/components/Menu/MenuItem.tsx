import cn from 'classnames';
import { type FC } from 'preact/compat';
import { type MusicList } from '@/apps/MP3Player/interfaces/MusicList';
import { ButtonLink } from '@/platform/components/ButtonLink/ButtonLink';
import styles from './MenuItem.module.scss';

export interface MenuItemProps {
  activeMusicList: MusicList;
  musicList: MusicList;
  onClickPlaylist(musicList: MusicList): void;
}

export const MenuItem: FC<MenuItemProps> = ({
  activeMusicList,
  onClickPlaylist,
  musicList,
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
