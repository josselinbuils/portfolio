import { faTerminal } from '@fortawesome/free-solid-svg-icons/faTerminal';
import { type AppDescriptor } from '@/platform/interfaces/AppDescriptor';

export const TerminalDescriptor: AppDescriptor = {
  description: 'Command-line interface.',
  // Factory with dynamic import so no cycle
  // eslint-disable-next-line import/no-cycle
  // factory: () => import('./Terminal'),
  icon: faTerminal,
  iconScale: 0.8,
  isMobileFriendly: true,
  name: 'Terminal',
};
