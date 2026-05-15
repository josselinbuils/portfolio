import { createRef, type FunctionComponent } from 'preact';
import { useContext } from 'preact/hooks';

import { useDragAndDrop } from '@/platform/hooks/useDragAndDrop';

import { AudioContext } from '../AudioProvider/AudioProvider';
import { ProgressBar } from './ProgressBar';
import classes from './SeekBar.module.css';

export const SeekBar: FunctionComponent = () => {
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
    <div className={classes.seekBar}>
      <time className={classes.currentTime}>{currentTime}</time>
      <ProgressBar
        onSeekStart={seekStartHandler}
        progress={progress}
        ref={progressBarRef}
      />
      <time className={classes.duration}>
        {currentMusic ? currentMusic.duration : '00:00'}
      </time>
    </div>
  );
};
