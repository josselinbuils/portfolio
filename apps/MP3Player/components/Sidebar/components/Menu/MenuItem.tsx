import cn from 'classnames';
import { FC } from 'react';
import { MusicList } from '~/apps/MP3Player/interfaces/MusicList';
import { ButtonLink } from '~/platform/components/ButtonLink/ButtonLink';

import styles from './MenuItem.module.scss';

export const MenuItem: FC<Props> = ({
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

interface Props {
  activeMusicList: MusicList;
  musicList: MusicList;
  onClickPlaylist(musicList: MusicList): void;
}
