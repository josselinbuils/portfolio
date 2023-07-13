import { faGamepad } from '@fortawesome/free-solid-svg-icons/faGamepad';
import { type AppDescriptor } from '@/platform/interfaces/AppDescriptor';

export const TeraviaDescriptor: AppDescriptor = {
  description: 'The cats are your enemies.',
  factory: () => import('./Teravia'),
  icon: faGamepad,
  iconScale: 0.8,
  isMobileFriendly: false,
  name: 'Teravia',
};
