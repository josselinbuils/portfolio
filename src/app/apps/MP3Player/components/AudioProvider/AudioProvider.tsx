import React, {
  createContext,
  Dispatch,
  FC,
  RefObject,
  SetStateAction,
  useEffect,
  useRef,
  useState
} from 'react';
import styles from './AudioProvider.module.scss';

export const AudioContext = createContext<AudioContextValue | undefined>(
  undefined
);

export const AudioProvider: FC = ({ children }) => {
  const audioElementRef = useRef<HTMLAudioElement>(null);
  const [currentMusicSrc, setCurrentMusicSrc] = useState<string>();

  useEffect(() => {
    if (audioElementRef.current !== null && currentMusicSrc !== undefined) {
      audioElementRef.current.load();
    }
  }, [audioElementRef, currentMusicSrc]);

  return (
    <>
      <AudioContext.Provider value={{ audioElementRef, setCurrentMusicSrc }}>
        {children}
      </AudioContext.Provider>
      <audio className={styles.audio} ref={audioElementRef}>
        {currentMusicSrc && <source src={currentMusicSrc} type="audio/mp3" />}
      </audio>
    </>
  );
};

export interface AudioContextValue {
  audioElementRef: RefObject<HTMLAudioElement>;
  setCurrentMusicSrc: Dispatch<SetStateAction<string | undefined>>;
}
