import { type FC } from 'preact/compat';
import { OperatingSystem } from '@/platform/components/OperatingSystem';

const AppPage: FC = () => {
  const lazyApp =
    typeof window !== 'undefined'
      ? window.location.pathname.split('/')[2]
      : undefined;

  return <OperatingSystem lazyApp={lazyApp} />;
};

export default AppPage;
