import { NextPage } from 'next';
import Terminal from '~/apps/Terminal';
import { Home } from '~/platform/components/Home';
import { InjectorProvider } from '~/platform/providers/InjectorProvider/InjectorProvider';
import { WindowManager } from '~/platform/services/WindowManager';
import { TerminalDescriptor } from '~/apps/Terminal/TerminalDescriptor';

WindowManager.defaultApp = {
  appDescriptor: TerminalDescriptor,
  // Only there for preload
  windowComponent: Terminal,
};

const Index: NextPage = () => (
  <InjectorProvider>
    <Home />
  </InjectorProvider>
);

export default Index;
