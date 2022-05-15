import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Home } from '~/platform/components/Home';
import { InjectorProvider } from '~/platform/providers/InjectorProvider/InjectorProvider';

const App: NextPage = () => {
  const router = useRouter();
  const { app } = router.query;

  return (
    <InjectorProvider>
      <Home lazyApp={app as string | undefined} />
    </InjectorProvider>
  );
};

export default App;
