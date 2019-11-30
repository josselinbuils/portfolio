import { AppDescriptor } from '../AppDescriptor';

export const TerminalDescriptor = {
  appName: 'Terminal',
  factory: () => import('./Terminal'),
  iconClass: 'fas fa-terminal'
} as AppDescriptor;
