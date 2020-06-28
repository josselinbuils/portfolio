import { useRouter } from 'next/router';
import { FC } from 'react';
import { Home } from '~/platform/components/Home';
import { InjectorContext } from '~/platform/hooks/useInjector';

console.log('app page');

const App: FC = () => {
  const router = useRouter();
  const app = router.query.app as string;

  return (
    <InjectorContext.Provider value={{}}>
      <Home app={app} />
    </InjectorContext.Provider>
  );
};

export default App;
