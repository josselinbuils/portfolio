import { faTerminal } from '@fortawesome/free-solid-svg-icons';
import { AppDescriptor } from '../AppDescriptor';

export const TerminalDescriptor = {
  appName: 'Terminal',
  factory: () => import('./Terminal'),
  icon: faTerminal,
  iconScale: 0.8,
} as AppDescriptor;
