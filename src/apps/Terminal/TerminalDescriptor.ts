import { faTerminal } from '@fortawesome/free-solid-svg-icons/faTerminal';

import { type AppDescriptor } from '@/platform/interfaces/AppDescriptor';

export const TerminalDescriptor: AppDescriptor = {
  description: 'Command-line interface.',
  factory: () => import('./Terminal'),
  icon: faTerminal,
  iconScale: 0.9,
  name: 'Terminal',
};
