import cn from 'classnames';
import React, { FC } from 'react';
import { ButtonLink } from '~/platform/components';
import { MusicList } from '../../../../interfaces';
import styles from './MenuItem.module.scss';

export const MenuItem: FC<Props> = ({
  activeMusicList,
  onClickPlaylist,
  musicList
}) => {
  const isActiveMusicList = musicList === activeMusicList;

  return (
    <ButtonLink
      className={cn(styles.item, { [styles.checked]: isActiveMusicList })}
      disabled={isActiveMusicList}
      onClick={() => onClickPlaylist(musicList)}
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
