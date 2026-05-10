import { createContext, type FunctionComponent } from 'preact';
import { type PropsWithChildren } from 'preact/compat';
import { useEffect, useMemo, useState } from 'preact/hooks';

import { AudioController, type AudioState } from './AudioController';

export const AudioContext = createContext<{
  audioController: AudioController | undefined;
  audioState: AudioState | undefined;
}>({
  audioController: undefined,
  audioState: undefined,
});

export const AudioProvider: FunctionComponent<PropsWithChildren> = ({
  children,
}) => {
  const audioController = useMemo(() => new AudioController(), []);
  const [audioState, setAudioState] = useState<AudioState>();

  useEffect(() => {
    const unsubscribe =
      audioController.audioStateSubject.subscribe(setAudioState);
    return () => {
      unsubscribe();
      audioController.clear();
    };
  }, [audioController]);

  const value = useMemo(
    () => ({ audioController, audioState }),
    [audioController, audioState],
  );

  return (
    <AudioContext.Provider value={value}>{children}</AudioContext.Provider>
  );
};
