import { type NextPage } from 'next';
import Terminal from '~/apps/Terminal/Terminal';
import { TerminalDescriptor } from '~/apps/Terminal/TerminalDescriptor';
import { type DefaultApp } from '~/platform/components/Home';
import { Home } from '~/platform/components/Home';
import { InjectorProvider } from '~/platform/providers/InjectorProvider/InjectorProvider';

const defaultApp: DefaultApp = {
  appDescriptor: TerminalDescriptor,
  windowComponent: Terminal,
};

const Index: NextPage = () => (
  <InjectorProvider>
    <Home defaultApp={defaultApp} />
  </InjectorProvider>
);

export default Index;
