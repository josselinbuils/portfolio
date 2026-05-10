import { type FunctionComponent } from 'preact';

import { OperatingSystem } from '@/platform/components/OperatingSystem';

const AppPage: FunctionComponent = () => {
  const lazyApp =
    typeof window !== 'undefined'
      ? window.location.pathname.split('/')[2]
      : undefined;

  return <OperatingSystem lazyApp={lazyApp} />;
};

export default AppPage;
