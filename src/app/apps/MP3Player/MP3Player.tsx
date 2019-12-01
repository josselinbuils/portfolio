import React, { useState } from 'react';
import { Window, WindowComponent } from '~/platform/components/Window';
import { AudioProvider } from './components';
import { MiniPlayer } from './MiniPlayer';
import { MP3PlayerDescriptor } from './MP3PlayerDescriptor';
import { Player } from './Player';

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
  const [min] = useState(false);
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
      <AudioProvider>{min ? <MiniPlayer /> : <Player />}</AudioProvider>
    </Window>
  );
};

MP3Player.appDescriptor = MP3PlayerDescriptor;

export default MP3Player;
