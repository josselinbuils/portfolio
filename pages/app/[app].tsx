import { useRouter } from 'next/router';
import { FC } from 'react';
import { Home } from '~/platform/components/Home';
import { InjectorProvider } from '~/platform/providers/InjectorProvider/InjectorProvider';

const App: FC = () => {
  const router = useRouter();
  const { app } = router.query;

  return (
    <InjectorProvider>
      <Home app={app as string} />
    </InjectorProvider>
  );
};

export default App;
