import cn from 'classnames';
import React, { FC } from 'react';
import { MusicList } from '~/apps/MP3Player/interfaces';
import commonStyles from '../../../../common.module.scss';
import styles from './MenuItem.module.scss';

export const MenuItem: FC<Props> = ({
  activeMusicList,
  onClickPlaylist,
  musicList
}) => {
  const isActiveMusicList = musicList === activeMusicList;

  return (
    <button
      className={cn(commonStyles.buttonLink, styles.item, {
        [styles.active]: isActiveMusicList
      })}
      disabled={isActiveMusicList}
      onClick={() => onClickPlaylist(musicList)}
    >
      {musicList.name}
    </button>
  );
};

interface Props {
  activeMusicList: MusicList;
  musicList: MusicList;
  onClickPlaylist(musicList: MusicList): void;
}
