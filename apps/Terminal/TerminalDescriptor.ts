import { faTerminal } from '@fortawesome/free-solid-svg-icons/faTerminal';
import { AppDescriptor } from '~/platform/interfaces/AppDescriptor';

export const TerminalDescriptor = {
  description: 'Command-line interface.',
  // eslint-disable-next-line import/no-cycle
  factory: () => import('./Terminal'),
  icon: faTerminal,
  iconScale: 0.8,
  name: 'Terminal',
} as AppDescriptor;
