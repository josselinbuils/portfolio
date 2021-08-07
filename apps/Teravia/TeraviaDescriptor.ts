import { faGamepad } from '@fortawesome/free-solid-svg-icons/faGamepad';
import { AppDescriptor } from '~/platform/interfaces/AppDescriptor';

export const TeraviaDescriptor = {
  description: 'The cats are your enemies.',
  factory: () => import('./Teravia'),
  icon: faGamepad,
  iconScale: 0.8,
  name: 'Teravia',
} as AppDescriptor;
