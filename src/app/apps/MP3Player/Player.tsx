import React, { FC, useState } from 'react';
import { Footer, JamendoLink, Logo, Menu } from './components';
import { MusicList } from './interfaces';
import { musicLists } from './musicLists';
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
      </div>
      <Footer />
    </div>
  );
};
