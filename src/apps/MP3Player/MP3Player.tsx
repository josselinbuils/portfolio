import { useCallback, useState } from 'preact/hooks';

import { Window } from '@/platform/components/Window/Window';
import { type WindowComponent } from '@/platform/components/Window/WindowComponent';

import { AudioProvider } from './components/AudioProvider/AudioProvider';
import { Footer } from './components/Footer/Footer';
import { Musics } from './components/Musics/Musics';
import { Sidebar } from './components/Sidebar/Sidebar';
import { type MusicList } from './interfaces/MusicList';
import classes from './MP3Player.module.css';
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
      className={classes.mp3PlayerWindow}
      minHeight={641}
      minWidth={950}
      ref={windowRef}
      resizable
      title="MP3Player"
      titleClassName={classes.mp3PlayerTitleBar}
      {...injectedWindowProps}
    >
      <AudioProvider>
        <div className={classes.player}>
          <div className={classes.body}>
            <Sidebar
              activeMusicList={activeMusicList}
              className={classes.sidebar}
              onClickMusicList={onClickMusicList}
            />
            <Musics className={classes.musics} musicList={activeMusicList} />
          </div>
          <Footer className={classes.footer} />
        </div>
      </AudioProvider>
    </Window>
  );
};

export default MP3Player;
