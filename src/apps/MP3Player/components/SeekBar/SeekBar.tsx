import { type FC, createRef, useContext } from 'preact/compat';
import { useDragAndDrop } from '@/platform/hooks/useDragAndDrop';
import { AudioContext } from '../AudioProvider/AudioProvider';
import { ProgressBar } from './ProgressBar';
import styles from './SeekBar.module.scss';

export const SeekBar: FC = () => {
  const { audioController, audioState } = useContext(AudioContext);
  const progressBarRef = createRef<HTMLDivElement>();
  const seekStartHandler = useDragAndDrop(onSeekStart);

  if (audioController === undefined || audioState === undefined) {
    return null;
  }

  const { setCurrentTime } = audioController;
  const { currentMusic, currentTime, progress } = audioState;

  function onSeekStart(
    downEvent: PointerEvent,
  ): ((moveEvent: PointerEvent) => void) | void {
    if (progressBarRef.current === null || currentMusic === undefined) {
      return;
    }

    const progressBarWidth = progressBarRef.current.clientWidth;
    const dx = downEvent.offsetX - downEvent.clientX;

    setCurrentTime((downEvent as MouseEvent).offsetX / progressBarWidth);

    return (moveEvent: PointerEvent) =>
      setCurrentTime((moveEvent.clientX + dx) / progressBarWidth);
  }

  return (
    <div className={styles.seekBar}>
      <time className={styles.currentTime}>{currentTime}</time>
      <ProgressBar
        progress={progress}
        onSeekStart={seekStartHandler}
        ref={progressBarRef}
      />
      <time className={styles.duration}>
        {currentMusic ? currentMusic.duration : '00:00'}
      </time>
    </div>
  );
};
