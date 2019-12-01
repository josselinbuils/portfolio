import cn from 'classnames';
import React, { FC, useState } from 'react';
import commonStyles from '../../common.module.scss';
import { Music, MusicList } from '../../interfaces';
import { musicLists } from '../../musicLists';
import { Footer, JamendoLink, Logo, Menu } from './components';
import styles from './Player.module.scss';

export const Player: FC<Props> = ({ currentMusic }) => {
  const [activeMusicList, setActiveMusicList] = useState<MusicList>(
    musicLists[0]
  );

  return (
    <div className={cn(commonStyles.player, styles.player)}>
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
      <Footer currentMusic={currentMusic} />
    </div>
  );
};

interface Props {
  currentMusic: Music | undefined;
}
