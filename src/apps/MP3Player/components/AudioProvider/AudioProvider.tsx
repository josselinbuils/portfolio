import {
  createContext,
  type FC,
  type PropsWithChildren,
  useEffect,
  useMemo,
  useState,
} from 'preact/compat';
import { AudioController, type AudioState } from './AudioController';

export const AudioContext = createContext<{
  audioController: AudioController | undefined;
  audioState: AudioState | undefined;
}>({
  audioController: undefined,
  audioState: undefined,
});

export const AudioProvider: FC<PropsWithChildren> = ({ children }) => {
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
