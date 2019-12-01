import {
  faArrowDown,
  faPauseCircle,
  faPlayCircle
} from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cn from 'classnames';
import React, { FC, useContext, useEffect, useState } from 'react';
import { AudioContext } from '~/apps/MP3Player/components/AudioProvider';
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

  useEffect(() => {
    loadTracks(musicList.path, order).then(setMusics);
  }, [musicList, order]);

  if (audioController === undefined || audioState === undefined) {
    return null;
  }

  const { playMusic } = audioController;
  const { currentMusic, paused } = audioState;

  return (
    <div className={styles.musicList}>
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
                onDoubleClick={() => playMusic(music)}
              >
                <td className={styles.colPreview}>
                  <div
                    className={styles.inlineMusicPreview}
                    style={{ backgroundImage: `url(${music.image})` }}
                  >
                    <FontAwesomeIcon
                      icon={
                        music === currentMusic && !paused
                          ? faPauseCircle
                          : faPlayCircle
                      }
                      onClick={() => playMusic(music)}
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
