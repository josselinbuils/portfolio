import '@fortawesome/fontawesome-svg-core/styles.css';
import { type FC } from 'preact/compat';
import Terminal from '@/apps/Terminal/Terminal';
import { TerminalDescriptor } from '@/apps/Terminal/TerminalDescriptor';
import { type DefaultApp } from '@/platform/components/App';
import { App } from '@/platform/components/App';
import './global.scss';

const defaultApp: DefaultApp = {
  appDescriptor: TerminalDescriptor,
  windowComponent: Terminal,
};

export const Home: FC = () => <App defaultApp={defaultApp} />;
