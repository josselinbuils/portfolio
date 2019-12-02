import React, { useState } from 'react';
import { Window, WindowComponent } from '~/platform/components/Window';
import { AudioProvider, MiniPlayer, Player } from './components';
import { MP3PlayerDescriptor } from './MP3PlayerDescriptor';

const size = {
  min: {
    width: 330,
    height: 150
  },
  max: {
    width: 950,
    height: 530
  }
};

const MP3Player: WindowComponent = injectedWindowProps => {
  const [min, setMin] = useState(false);
  const { height, width } = min ? size.min : size.max;

  return (
    <Window
      {...injectedWindowProps}
      background="#111625"
      minHeight={height}
      minWidth={width}
      resizable={!min}
      title={min ? '' : MP3PlayerDescriptor.appName}
      titleColor="#efefef"
    >
      <AudioProvider>
        {min ? (
          <MiniPlayer onClickTogglePlaylist={() => setMin(false)} />
        ) : (
          <Player onClickTogglePlaylist={() => setMin(true)} />
        )}
      </AudioProvider>
    </Window>
  );
};

MP3Player.appDescriptor = MP3PlayerDescriptor;

export default MP3Player;
