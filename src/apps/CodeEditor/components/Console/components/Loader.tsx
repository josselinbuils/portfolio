import { type FunctionComponent } from 'preact';
import { useEffect } from 'preact/hooks';

import { Spinner } from '@/platform/components/Spinner/Spinner';

export type LoaderProps = {
  onStateChange(loading: boolean): unknown;
};

export const Loader: FunctionComponent<LoaderProps> = ({ onStateChange }) => {
  useEffect(() => {
    onStateChange(true);

    return () => {
      onStateChange(false);
    };
  }, [onStateChange]);

  return <Spinner color="#c3c3c3" />;
};
