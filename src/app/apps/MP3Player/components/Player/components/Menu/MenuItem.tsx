import React, { FC } from 'react';
import { MusicList } from '~/apps/MP3Player/interfaces';
import { Button } from '../../../Button';
import styles from './MenuItem.module.scss';

export const MenuItem: FC<Props> = ({
  activeMusicList,
  onClickPlaylist,
  musicList
}) => {
  const isActiveMusicList = musicList === activeMusicList;

  return (
    <Button
      checked={isActiveMusicList}
      className={styles.item}
      disabled={isActiveMusicList}
      onClick={() => onClickPlaylist(musicList)}
    >
      {musicList.name}
    </Button>
  );
};

interface Props {
  activeMusicList: MusicList;
  musicList: MusicList;
  onClickPlaylist(musicList: MusicList): void;
}
