import React, { FC, useState } from 'react';
import { MusicList } from '../../interfaces';
import { musicLists } from '../../musicLists';
import { Footer, JamendoLink, Logo, Menu, Musics } from './components';
import styles from './Player.module.scss';

export const Player: FC = () => {
  const [activeMusicList, setActiveMusicList] = useState<MusicList>(
    musicLists[0]
  );

  return (
    <div className={styles.player}>
      <div className={styles.body}>
        <aside className={styles.sidebar}>
          <Logo />
          <Menu
            activeMusicList={activeMusicList}
            onClickMusicList={setActiveMusicList}
          />
          <JamendoLink />
        </aside>
        <Musics musicList={activeMusicList} />
      </div>
      <Footer />
    </div>
  );
};
