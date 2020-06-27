import { useRouter } from 'next/router';
import { FC, useEffect } from 'react';
import { Home } from '~/platform/components/Home';
import { useInjector } from '~/platform/hooks/useInjector';
import { WindowManager } from '~/platform/services/WindowManager';
import { getAppDescriptors } from '~/platform/utils/getAppDescriptors';

const App: FC = () => {
  const windowManager = useInjector(WindowManager);
  const router = useRouter();
  const app = router.query.app as string;

  useEffect(() => {
    const descriptor = getAppDescriptors()[app];

    if (descriptor !== undefined) {
      windowManager.openWindow(descriptor, { startMaximized: true });
    }
  }, [app, windowManager]);

  return <Home />;
};

export default App;
