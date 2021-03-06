import { faTerminal } from '@fortawesome/free-solid-svg-icons/faTerminal';
import { AppDescriptor } from '~/platform/interfaces/AppDescriptor';

export const TerminalDescriptor = {
  appName: 'Terminal',
  factory: () => import('./Terminal'),
  icon: faTerminal,
  iconScale: 0.8,
} as AppDescriptor;
