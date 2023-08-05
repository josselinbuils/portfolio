import { type FC, useEffect } from 'preact/compat';
import { Spinner } from '@/platform/components/Spinner/Spinner';

export interface LoaderProps {
  onStateChange(loading: boolean): unknown;
}

export const Loader: FC<LoaderProps> = ({ onStateChange }) => {
  useEffect(() => {
    onStateChange(true);

    return () => {
      onStateChange(false);
    };
  }, [onStateChange]);

  return <Spinner color="#c3c3c3" />;
};
