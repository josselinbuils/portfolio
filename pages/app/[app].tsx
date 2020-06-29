import { NextPage } from 'next';
import { useRouter } from 'next/router';
import { Home } from '~/platform/components/Home';
import { InjectorProvider } from '~/platform/providers/InjectorProvider/InjectorProvider';

const App: NextPage = () => {
  const router = useRouter();
  const { app } = router.query;

  return (
    <InjectorProvider>
      <Home app={app as string} />
    </InjectorProvider>
  );
};

export default App;
