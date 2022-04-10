import cn from 'classnames';
import { FC, useCallback, useLayoutEffect, useState } from 'react';
import { useMobile } from '~/platform/hooks/useMobile';
import { MusicList } from '../../interfaces/MusicList';
import { musicLists } from '../../musicLists';
import { Footer } from './components/Footer/Footer';
import { JamendoLink } from './components/JamendoLink/JamendoLink';
import { Logo } from './components/Logo/Logo';
import { Menu } from './components/Menu/Menu';
import { Musics } from './components/Musics/Musics';

import styles from './Player.module.scss';

export const Player: FC<Props> = ({ min, onClickTogglePlaylist }) => {
  const isMobile = useMobile();
  const [activeMusicList, setActiveMusicList] = useState<MusicList>(
    musicLists[0]
  );
  const [showSidebar, setShowSidebar] = useState(!isMobile);

  console.log({ isMobile });

  useLayoutEffect(() => {
    setShowSidebar(!isMobile);
  }, [isMobile]);

  const onClickMusicList = useCallback(
    (playlist: MusicList) => {
      setActiveMusicList(playlist);

      if (isMobile) {
        setShowSidebar(false);
      }
    },
    [isMobile]
  );

  return (
    <div className={cn(styles.player, { [styles.hidden]: min })}>
      <div className={styles.body}>
        {showSidebar && (
          <aside className={styles.sidebar}>
            <Logo />
            <Menu
              activeMusicList={activeMusicList}
              onClickMusicList={onClickMusicList}
            />
            <JamendoLink />
          </aside>
        )}
        <Musics
          className={styles.musics}
          musicList={activeMusicList}
          showMenuButton={isMobile}
          onMenuButtonClick={() => setShowSidebar(!showSidebar)}
        />
      </div>
      <Footer
        className={styles.footer}
        onClickTogglePlaylist={onClickTogglePlaylist}
      />
    </div>
  );
};

interface Props {
  min: boolean;
  onClickTogglePlaylist(): void;
}
