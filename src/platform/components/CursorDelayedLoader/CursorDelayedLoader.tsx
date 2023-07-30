import { type FunctionComponent, useLayoutEffect } from 'preact/compat';
import styles from './CursorDelayedLoader.module.scss';

const LOADER_APPARITION_DELAY_MS = 500;

export const CursorDelayedLoader: FunctionComponent = () => {
  useLayoutEffect(() => {
    const displayLoaderTimeout = setTimeout(
      () => document.body.classList.add(styles.withLoadingCursor),
      LOADER_APPARITION_DELAY_MS,
    );

    return () => {
      clearTimeout(displayLoaderTimeout);
      document.body.classList.remove(styles.withLoadingCursor);
    };
  }, []);

  return null;
};
