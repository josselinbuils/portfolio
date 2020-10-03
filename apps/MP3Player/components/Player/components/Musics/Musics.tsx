import { faPauseCircle } from '@fortawesome/free-solid-svg-icons/faPauseCircle';
import { faPlayCircle } from '@fortawesome/free-solid-svg-icons/faPlayCircle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cn from 'classnames';
import { FC, useContext, useEffect, useState } from 'react';
import { AudioContext } from '~/apps/MP3Player/components/AudioProvider';
import { Music } from '~/apps/MP3Player/interfaces/Music';
import { MusicList } from '~/apps/MP3Player/interfaces/MusicList';
import { loadMusics } from '~/apps/MP3Player/utils/loadMusics';
import { Select } from '~/platform/components/Select/Select';
import { Spinner } from '~/platform/components/Spinner/Spinner';
import { cancelable } from '~/platform/utils/cancelable';

import styles from './Musics.module.scss';

const ORDERS = [
  { name: 'Top All', value: 'popularity_total' },
  { name: 'Top Month', value: 'popularity_month' },
  { name: 'Top Week', value: 'popularity_week' },
];

export const Musics: FC<Props> = ({ musicList }) => {
  const { audioController, audioState } = useContext(AudioContext);
  const [musics, setMusics] = useState<Music[]>([]);
  const [jamendoOrder, setJamendoOrder] = useState<string>('popularity_total');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    setMusics([]);

    const [tracksPromise, cancelTracksPromise] = cancelable(
      loadMusics(musicList.jamendoTag, jamendoOrder)
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
    <div className={styles.musicList}>
      {loading && <Spinner color="#007ad8" />}
      <div className={styles.header}>
        <div>
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
        <table className={styles.header}>
          <thead>
            <tr>
              {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
              <th className={styles.colPreview} scope="col" />
              <th scope="col">Title</th>
              <th className={styles.colArtist} scope="col">
                Artist
              </th>
              <th className={styles.colAlbum} scope="col">
                Album
              </th>
              <th className={styles.colRelease} scope="col">
                Release
              </th>
              <th className={styles.colDuration} scope="col">
                Duration
              </th>
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
                onDoubleClick={() => play(music)}
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
                      onClick={() => play(music)}
                    />
                  </div>
                </td>

                <td>{music.name}</td>
                <td className={styles.colArtist}>{music.artistName}</td>
                <td className={styles.colAlbum}>{music.albumName}</td>
                <td className={styles.colRelease}>{music.releaseDate}</td>
                <td className={styles.colDuration}>{music.duration}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

interface Props {
  musicList: MusicList;
}
