import cn from 'classnames';
import React, { FC, useState } from 'react';
import { playlists } from '~/apps/MP3Player/playlists';
import commonStyles from '../../common.module.scss';
import { Music, Playlist } from '../../interfaces';
import { JamendoLink, Logo, Menu } from './components';
import styles from './Player.module.scss';

export const Player: FC<Props> = ({ currentMusic }) => {
  const [activePlaylist, setActivePlaylist] = useState<Playlist>(playlists[0]);

  return (
    <div className={cn(commonStyles.player, styles.player)}>
      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <Logo />
          <Menu
            activePlaylist={activePlaylist}
            onClickPlaylist={setActivePlaylist}
          />
          <JamendoLink />
        </aside>
      </div>
    </div>
  );
};

interface Props {
  currentMusic?: Music;
}
