import { faPause } from '@fortawesome/free-solid-svg-icons/faPause';
import { faPlay } from '@fortawesome/free-solid-svg-icons/faPlay';
import cn from 'classnames';
import { type FunctionComponent } from 'preact';
import { useContext } from 'preact/hooks';

import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';

import { AudioContext } from '../AudioProvider/AudioProvider';
import { Controls } from '../Controls/Controls';
import { MusicPreview } from '../MusicPreview/MusicPreview';
import { SeekBar } from '../SeekBar/SeekBar';
import { Visualizer } from '../Visualizer/Visualizer';
import classes from './Footer.module.css';
import { MusicInfo } from './MusicInfo';

export type FooterProps = {
  className?: string;
};

export const Footer: FunctionComponent<FooterProps> = ({ className }) => {
  const { audioState } = useContext(AudioContext);

  if (audioState === undefined) {
    return null;
  }

  const { currentMusic, currentTime, paused, progress } = audioState;
  const isPlaying = !paused && currentMusic !== undefined;

  return (
    <footer className={cn(classes.footer, className)}>
      <MusicPreview music={currentMusic} size={64} />
      <div className={classes.console}>
        <div className={classes.lcd}>
          <div className={classes.lcdTop}>
            <span className={classes.time}>
              <FontAwesomeIcon
                className={classes.stateIcon}
                icon={isPlaying ? faPlay : faPause}
              />
              {currentTime}
            </span>
            <MusicInfo
              className={classes.marquee}
              music={currentMusic}
              paused={!isPlaying}
            />
          </div>
          <div className={classes.lcdBottom}>
            <Visualizer
              className={classes.visualizer}
              peaks={currentMusic?.waveform?.peaks}
              playing={isPlaying}
              progress={progress}
            />
            <span
              className={cn(classes.indicators, {
                [classes.lit]: currentMusic !== undefined,
              })}
            >
              <b>192</b> kbps
              <i className={classes.sep} />
              <b>44</b> kHz
              <i className={classes.sep} />
              <b>stereo</b>
            </span>
          </div>
        </div>
        <div className={classes.transport}>
          <Controls size={32} />
          <SeekBar />
        </div>
      </div>
    </footer>
  );
};
