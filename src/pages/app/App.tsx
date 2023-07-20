import { type FC } from 'preact/compat';
import { OperatingSystem } from '@/platform/components/OperatingSystem';

export const App: FC = () => {
  const lazyApp =
    typeof window !== 'undefined'
      ? window.location.pathname.split('/')[2]
      : undefined;

  return <OperatingSystem lazyApp={lazyApp} />;
};
