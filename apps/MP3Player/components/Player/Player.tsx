import cn from 'classnames';
import { FC, useState } from 'react';
import { MusicList } from '../../interfaces/MusicList';
import { musicLists } from '../../musicLists';
import { Footer } from './components/Footer/Footer';
import { JamendoLink } from './components/JamendoLink/JamendoLink';
import { Logo } from './components/Logo/Logo';
import { Menu } from './components/Menu/Menu';
import { Musics } from './components/Musics/Musics';

import styles from './Player.module.scss';

export const Player: FC<Props> = ({ min, onClickTogglePlaylist }) => {
  const [activeMusicList, setActiveMusicList] = useState<MusicList>(
    musicLists[0]
  );

  return (
    <div className={cn(styles.player, { [styles.hidden]: min })}>
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
      <Footer onClickTogglePlaylist={onClickTogglePlaylist} />
    </div>
  );
};

interface Props {
  min: boolean;
  onClickTogglePlaylist(): void;
}
