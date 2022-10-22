import { useCallback, useLayoutEffect, useState } from 'react';
import { Window } from '~/platform/components/Window/Window';
import type { WindowComponent } from '~/platform/components/Window/WindowComponent';
import { useMobile } from '~/platform/hooks/useMobile';
import styles from './MP3Player.module.scss';
import { AudioProvider } from './components/AudioProvider/AudioProvider';
import { Footer } from './components/Footer/Footer';
import { Musics } from './components/Musics/Musics';
import { Sidebar } from './components/Sidebar/Sidebar';
import type { MusicList } from './interfaces/MusicList';
import { musicLists } from './musicLists';

const MP3Player: WindowComponent = ({ windowRef, ...injectedWindowProps }) => {
  const isMobile = useMobile();
  const [activeMusicList, setActiveMusicList] = useState<MusicList>(
    musicLists[0]
  );
  const [showSidebar, setShowSidebar] = useState(!isMobile);

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
    <Window
      background="#111625"
      minHeight={641}
      minWidth={950}
      ref={windowRef}
      resizable
      title="MP3Player"
      titleColor="#efefef"
      {...injectedWindowProps}
    >
      <AudioProvider>
        <div className={styles.player}>
          <div className={styles.body}>
            <Sidebar
              activeMusicList={activeMusicList}
              className={styles.sidebar}
              isMobile={isMobile}
              isVisible={showSidebar}
              onClickMusicList={onClickMusicList}
            />
            <Musics
              className={styles.musics}
              musicList={activeMusicList}
              showMenuButton={isMobile}
              onMenuButtonClick={() => setShowSidebar(!showSidebar)}
            />
          </div>
          <Footer className={styles.footer} />
        </div>
      </AudioProvider>
    </Window>
  );
};

export default MP3Player;
