import { type FunctionComponent } from 'preact';
import { useLayoutEffect } from 'preact/hooks';

import classes from './CursorDelayedLoader.module.css';

const LOADER_APPARITION_DELAY_MS = 500;

export const CursorDelayedLoader: FunctionComponent = () => {
  useLayoutEffect(() => {
    const displayLoaderTimeout = setTimeout(
      () => document.body.classList.add(classes.withLoadingCursor),
      LOADER_APPARITION_DELAY_MS,
    );

    return () => {
      clearTimeout(displayLoaderTimeout);
      document.body.classList.remove(classes.withLoadingCursor);
    };
  }, []);

  return null;
};
