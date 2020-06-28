import { FC } from 'react';
import Terminal from '~/apps/Terminal';
import { Home } from '~/platform/components/Home';
import { InjectorProvider } from '~/platform/providers/InjectorProvider/InjectorProvider';
import { WindowManager } from '~/platform/services/WindowManager';

WindowManager.defaultApp = Terminal;

const Index: FC = () => (
  <InjectorProvider>
    <Home />
  </InjectorProvider>
);

export default Index;
