import { faArrowDown } from '@fortawesome/free-solid-svg-icons/faArrowDown';
import { faPauseCircle } from '@fortawesome/free-solid-svg-icons/faPauseCircle';
import { faPlayCircle } from '@fortawesome/free-solid-svg-icons/faPlayCircle';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cn from 'classnames';
import { FC, useContext, useEffect, useState } from 'react';
import { Music } from '~/apps/MP3Player/interfaces/Music';
import { MusicList } from '~/apps/MP3Player/interfaces/MusicList';
import { loadMusics } from '~/apps/MP3Player/utils/loadMusics';
import { Select } from '~/platform/components/Select/Select';
import { Spinner } from '~/platform/components/Spinner/Spinner';
import { cancelable } from '~/platform/utils/cancelable';
import { AudioContext } from '../../../AudioProvider/AudioProvider';
import { Button } from '../../../Button/Button';

import styles from './Musics.module.scss';

const ORDERS = [
  { name: 'Top All', value: 'popularity_total' },
  { name: 'Top Month', value: 'popularity_month' },
  { name: 'Top Week', value: 'popularity_week' },
];

interface Props {
  className?: string;
  musicList: MusicList;
  onMenuButtonClick: () => unknown;
  showMenuButton: boolean;
}

export const Musics: FC<Props> = ({
  className,
  musicList,
  onMenuButtonClick,
  showMenuButton,
}) => {
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
    <div className={cn(styles.musicList, className)}>
      {loading && <Spinner color="#007ad8" />}
      <div className={styles.header}>
        <div>
          <h2>{musicList.name}</h2>
          {showMenuButton && (
            <Button
              className={styles.showMenuButton}
              onClick={onMenuButtonClick}
            >
              <FontAwesomeIcon className={styles.icon} icon={faArrowDown} />
            </Button>
          )}
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
              <th scope="col">Artist</th>
              <th className={styles.colAlbum} scope="col">
                Album
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
                <td>{music.artistName}</td>
                <td className={styles.colAlbum}>{music.albumName}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
