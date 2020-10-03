import { useState } from 'react';
import { Window } from '~/platform/components/Window/Window';
import { WindowComponent } from '~/platform/components/Window/WindowComponent';
import { AudioProvider } from './components/AudioProvider/AudioProvider';
import { MiniPlayer } from './components/MiniPlayer/MiniPlayer';
import { Player } from './components/Player/Player';
import { MP3PlayerDescriptor } from './MP3PlayerDescriptor';

const size = {
  min: {
    width: 330,
    height: 150,
  },
  max: {
    width: 950,
    height: 530,
  },
};

const MP3Player: WindowComponent = ({ windowRef, ...injectedWindowProps }) => {
  const [min, setMin] = useState(false);
  const { height, width } = min ? size.min : size.max;

  return (
    <Window
      {...injectedWindowProps}
      background="#111625"
      maxHeight={min ? height : Infinity}
      maxWidth={min ? width : Infinity}
      minHeight={height}
      minWidth={width}
      ref={windowRef}
      resizable={!min}
      title={min ? '' : MP3PlayerDescriptor.appName}
      titleColor="#efefef"
    >
      <AudioProvider>
        <MiniPlayer min={min} onClickTogglePlaylist={() => setMin(false)} />
        <Player min={min} onClickTogglePlaylist={() => setMin(true)} />
      </AudioProvider>
    </Window>
  );
};

export default MP3Player;
