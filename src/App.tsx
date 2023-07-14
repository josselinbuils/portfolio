import '@fortawesome/fontawesome-svg-core/styles.css';
import { type FC } from 'preact/compat';
import Terminal from '@/apps/Terminal/Terminal';
import { TerminalDescriptor } from '@/apps/Terminal/TerminalDescriptor';
import { type DefaultApp } from '@/platform/components/Home';
import { Home } from '@/platform/components/Home';
import { InjectorProvider } from '@/platform/providers/InjectorProvider/InjectorProvider';
import './global.scss';

const defaultApp: DefaultApp = {
  appDescriptor: TerminalDescriptor,
  windowComponent: Terminal,
};

export const App: FC = () => (
  <InjectorProvider>
    <Home defaultApp={defaultApp} />
  </InjectorProvider>
);
