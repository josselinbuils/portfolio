import {
  faArrowDown,
  faPauseCircle,
  faPlayCircle
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cn from 'classnames';
import React, { FC, useContext, useEffect, useRef, useState } from 'react';
import { Spinner } from '~/platform/components';
import { AudioContext } from '../../../../components/AudioProvider';
import { Music, MusicList } from '../../../../interfaces';
import { loadTracks } from '../../../../utils';
import styles from './Musics.module.scss';

const ORDERS = [
  { name: 'Top All', value: 'popularity_total' },
  { name: 'Top Month', value: 'popularity_month' },
  { name: 'Top Week', value: 'popularity_week' }
];

export const Musics: FC<Props> = ({ musicList }) => {
  const { audioController, audioState } = useContext(AudioContext);
  const [musics, setMusics] = useState<Music[]>([]);
  const [order, setOrder] = useState<string>('popularity_total');
  const [loading, setLoading] = useState(false);

  const loadingPromiseRef = useRef<Promise<any>>(Promise.resolve());

  useEffect(() => {
    setLoading(true);
    setMusics([]);

    const promise = loadTracks(musicList.path, order)
      .then(newMusics => {
        if (loadingPromiseRef.current === promise) {
          setMusics(newMusics);
        }
      })
      .finally(() => {
        if (loadingPromiseRef.current === promise) {
          setLoading(false);
        }
      });

    loadingPromiseRef.current = promise;
  }, [musicList.path, order]);

  if (audioController === undefined || audioState === undefined) {
    return null;
  }

  const { playMusic, setPlaylist } = audioController;
  const { currentMusic, paused } = audioState;

  function play(music: Music): void {
    setPlaylist(musics);
    playMusic(music);
  }

  return (
    <div className={styles.musicList}>
      {loading && <Spinner color="#007ad8" />}
      <div className={styles.header}>
        <div>
          <h2>{musicList.name}</h2>
          <div className={styles.select}>
            <FontAwesomeIcon className={styles.selectIcon} icon={faArrowDown} />
            <select
              onChange={event => setOrder(event.target.value)}
              value={order}
            >
              {ORDERS.map(({ name, value }) => (
                <option key={value} value={value}>
                  {name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <table className={styles.header}>
          <thead>
            <tr>
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
            {musics.map(music => (
              <tr
                className={cn({
                  [styles.active]: currentMusic && music.id === currentMusic.id
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
                <td className={styles.colArtist}>{music.artist_name}</td>
                <td className={styles.colAlbum}>{music.album_name}</td>
                <td className={styles.colRelease}>{music.releasedate}</td>
                <td className={styles.colDuration}>{music.readableDuration}</td>
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
