import React, { useRef, useState } from 'react';
import { Window, WindowComponent } from '~/platform/components/Window';
import { Audio } from './components';
import { MiniPlayer, Player } from './templates';

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

export const MP3Player: WindowComponent = injectedWindowProps => {
  const [min] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { height, width } = min ? size.min : size.max;

  return (
    <Window
      {...injectedWindowProps}
      background="#111625"
      minHeight={height}
      minWidth={width}
      resizable={!min}
      title={min ? '' : MP3Player.appName}
      titleColor="#efefef"
    >
      {min ? (
        <MiniPlayer currentMusic={undefined} />
      ) : (
        <Player currentMusic={undefined} />
      )}
      <Audio innerRef={audioRef} />
    </Window>
  );
};

MP3Player.appName = 'MP3Player';
MP3Player.iconClass = 'fas fas fa-headphones';
