import { faPauseCircle } from '@fortawesome/free-solid-svg-icons/faPauseCircle';
import { faPlayCircle } from '@fortawesome/free-solid-svg-icons/faPlayCircle';
import cn from 'classnames';
import { type FunctionComponent } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';

import { type Music } from '@/apps/MP3Player/interfaces/Music';
import { type MusicList } from '@/apps/MP3Player/interfaces/MusicList';
import { loadMusics } from '@/apps/MP3Player/utils/loadMusics';
import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';
import { Select } from '@/platform/components/Select/Select';
import { Spinner } from '@/platform/components/Spinner/Spinner';
import { cancelable } from '@/platform/utils/cancelable';

import { AudioContext } from '../AudioProvider/AudioProvider';
import classes from './Musics.module.css';

const ORDERS = [
  { name: 'Top All', value: 'popularity_total' },
  { name: 'Top Month', value: 'popularity_month' },
  { name: 'Top Week', value: 'popularity_week' },
];

export type MusicsProps = {
  className?: string;
  musicList: MusicList;
};

export const Musics: FunctionComponent<MusicsProps> = ({
  className,
  musicList,
}) => {
  const { audioController, audioState } = useContext(AudioContext);
  const [musics, setMusics] = useState<Music[]>([]);
  const [jamendoOrder, setJamendoOrder] = useState<string>('popularity_total');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setMusics([]);

    const [tracksPromise, cancelTracksPromise] = cancelable(
      loadMusics(musicList.jamendoTag, jamendoOrder),
    );
    tracksPromise.then(setMusics).finally(() => setLoading(false));

    return cancelTracksPromise;
  }, [musicList.jamendoTag, jamendoOrder]);

  if (audioController === undefined || audioState === undefined) {
    return null;
  }

  const { playMusic, setPlaylist } = audioController;
  const { currentMusic, paused } = audioState;

  async function play(music: Music): Promise<void> {
    setPlaylist(musics);
    return playMusic(music);
  }

  return (
    <div className={cn(classes.musicList, className)}>
      {loading && <Spinner color="#1fe61f" />}
      <div className={classes.header}>
        <div className={classes.listInfo}>
          <h2>{musicList.name}</h2>
          <Select
            className={classes.select}
            onChange={setJamendoOrder}
            value={jamendoOrder}
          >
            {ORDERS.map(({ name, value }) => (
              <option key={value} value={value}>
                {name}
              </option>
            ))}
          </Select>
        </div>
        <table className={classes.tableHeader}>
          <thead>
            <tr>
              {}
              <th className={classes.colPreview} scope="col" />
              <th scope="col">Title</th>
              <th scope="col">Album</th>
            </tr>
          </thead>
        </table>
      </div>
      <div className={classes.overflow}>
        <table>
          <tbody>
            {musics.map((music) => (
              <tr
                className={cn({
                  [classes.active]:
                    currentMusic && music.id === currentMusic.id,
                })}
                key={music.id}
                onClick={() => play(music)}
              >
                <td className={classes.colPreview}>
                  <div
                    className={classes.inlineMusicPreview}
                    style={{ backgroundImage: `url(${music.image})` }}
                  >
                    <FontAwesomeIcon
                      className={classes.previewIcon}
                      icon={
                        music === currentMusic && !paused
                          ? faPauseCircle
                          : faPlayCircle
                      }
                    />
                  </div>
                </td>

                <td>
                  <p className={classes.musicName}>{music.name}</p>
                  <p className={classes.artistName}>{music.artistName}</p>
                </td>
                <td className={classes.album}>{music.albumName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
