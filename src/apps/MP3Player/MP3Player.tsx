import { useCallback, useState } from 'preact/compat';
import { Window } from '@/platform/components/Window/Window';
import { type WindowComponent } from '@/platform/components/Window/WindowComponent';
import styles from './MP3Player.module.scss';
import { AudioProvider } from './components/AudioProvider/AudioProvider';
import { Footer } from './components/Footer/Footer';
import { Musics } from './components/Musics/Musics';
import { Sidebar } from './components/Sidebar/Sidebar';
import { type MusicList } from './interfaces/MusicList';
import { musicLists } from './musicLists';

const MP3Player: WindowComponent = ({ windowRef, ...injectedWindowProps }) => {
  const [activeMusicList, setActiveMusicList] = useState<MusicList>(
    musicLists[0],
  );

  const onClickMusicList = useCallback((playlist: MusicList) => {
    setActiveMusicList(playlist);
  }, []);

  return (
    <Window
      className={styles.mp3PlayerWindow}
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
              onClickMusicList={onClickMusicList}
            />
            <Musics className={styles.musics} musicList={activeMusicList} />
          </div>
          <Footer className={styles.footer} />
        </div>
      </AudioProvider>
    </Window>
  );
};

export default MP3Player;
