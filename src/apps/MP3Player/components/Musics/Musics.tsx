import { faPauseCircle } from '@fortawesome/free-solid-svg-icons/faPauseCircle';
import { faPlayCircle } from '@fortawesome/free-solid-svg-icons/faPlayCircle';
import cn from 'classnames';
import { type FC, useContext, useEffect, useState } from 'preact/compat';
import { type Music } from '@/apps/MP3Player/interfaces/Music';
import { type MusicList } from '@/apps/MP3Player/interfaces/MusicList';
import { loadMusics } from '@/apps/MP3Player/utils/loadMusics';
import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';
import { Select } from '@/platform/components/Select/Select';
import { Spinner } from '@/platform/components/Spinner/Spinner';
import { cancelable } from '@/platform/utils/cancelable';
import { AudioContext } from '../AudioProvider/AudioProvider';
import styles from './Musics.module.scss';

const ORDERS = [
  { name: 'Top All', value: 'popularity_total' },
  { name: 'Top Month', value: 'popularity_month' },
  { name: 'Top Week', value: 'popularity_week' },
];

export interface MusicsProps {
  className?: string;
  musicList: MusicList;
}

export const Musics: FC<MusicsProps> = ({ className, musicList }) => {
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
    <div className={cn(styles.musicList, className)}>
      {loading && <Spinner color="#007ad8" />}
      <div className={styles.header}>
        <div className={styles.listInfo}>
          <h2>{musicList.name}</h2>
          <Select
            className={styles.select}
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
        <table className={styles.tableHeader}>
          <thead>
            <tr>
              {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
              <th className={styles.colPreview} scope="col" />
              <th scope="col">Title</th>
              <th scope="col">Album</th>
            </tr>
          </thead>
        </table>
      </div>
      <div className={styles.overflow}>
        <table>
          <tbody>
            {musics.map((music) => (
              <tr
                className={cn({
                  [styles.active]: currentMusic && music.id === currentMusic.id,
                })}
                key={music.id}
                onClick={() => play(music)}
              >
                <td className={styles.colPreview}>
                  <div
                    className={styles.inlineMusicPreview}
                    style={{ backgroundImage: `url(${music.image})` }}
                  >
                    <FontAwesomeIcon
                      className={styles.previewIcon}
                      icon={
                        music === currentMusic && !paused
                          ? faPauseCircle
                          : faPlayCircle
                      }
                    />
                  </div>
                </td>

                <td>
                  <p className={styles.musicName}>{music.name}</p>
                  <p className={styles.artistName}>{music.artistName}</p>
                </td>
                <td className={styles.album}>{music.albumName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
