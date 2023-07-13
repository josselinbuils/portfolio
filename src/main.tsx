import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import Terminal from '@/apps/Terminal/Terminal';
import { TerminalDescriptor } from '@/apps/Terminal/TerminalDescriptor';
import { type DefaultApp } from '@/platform/components/Home';
import { Home } from '@/platform/components/Home';
import { InjectorProvider } from '@/platform/providers/InjectorProvider/InjectorProvider';
import './main.scss';

const defaultApp: DefaultApp = {
  appDescriptor: TerminalDescriptor,
  windowComponent: Terminal,
};

createRoot(document.getElementById('app')!).render(
  <StrictMode>
    <InjectorProvider>
      <Home defaultApp={defaultApp} />
    </InjectorProvider>
  </StrictMode>,
);
