import { useContext, useEffect, useState } from 'react';
import { AudioController } from './AudioController';
import { AudioContext, AudioContextValue } from './AudioProvider';

export function useAudioController(): AudioController | undefined {
  const { audioElementRef, setCurrentMusicSrc } = useContext(
    AudioContext
  ) as AudioContextValue;
  const [audioController, setAudioController] = useState<AudioController>();
  const audioElement = audioElementRef.current;

  useEffect(() => {
    if (audioElement !== null) {
      setAudioController(new AudioController(audioElement));
    }
  }, [audioElement]);

  useEffect(() => {
    if (audioController !== undefined) {
      audioController.currentMusicSubject.subscribe(music =>
        setCurrentMusicSrc(music.audio)
      );

      return () => {
        audioController.destroy();
      };
    }
  }, [audioController, setCurrentMusicSrc]);

  return audioController;
}
