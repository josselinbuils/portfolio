import dynamic from 'next/dynamic';
import { useState } from 'react';
import { Window } from '~/platform/components/Window/Window';
import { WindowComponent } from '~/platform/components/Window/WindowComponent';
import { AudioProvider } from './components/AudioProvider/AudioProvider';
import { Player } from './components/Player/Player';

const MiniPlayer = dynamic(
  async () => (await import('./components/MiniPlayer/MiniPlayer')).MiniPlayer
);

const size = {
  min: {
    width: 330,
    height: 150,
  },
  max: {
    width: 950,
    height: 600,
  },
};

const MP3Player: WindowComponent = ({ windowRef, ...injectedWindowProps }) => {
  const [min, setMin] = useState(false);
  const { height, width } = min ? size.min : size.max;

  return (
    <Window
      background="#111625"
      maxHeight={min ? height : Infinity}
      maxWidth={min ? width : Infinity}
      minHeight={height}
      minWidth={width}
      ref={windowRef}
      resizable={!min}
      title={min ? '' : 'MP3Player'}
      titleColor="#efefef"
      {...injectedWindowProps}
    >
      <AudioProvider>
        {min && <MiniPlayer onClickTogglePlaylist={() => setMin(false)} />}
        <Player min={min} onClickTogglePlaylist={() => setMin(true)} />
      </AudioProvider>
    </Window>
  );
};

export default MP3Player;
