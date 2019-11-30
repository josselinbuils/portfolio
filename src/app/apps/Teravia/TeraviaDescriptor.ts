import { faGamepad } from '@fortawesome/free-solid-svg-icons';
import { AppDescriptor } from '../AppDescriptor';

export const TeraviaDescriptor = {
  appName: 'Teravia',
  factory: () => import('./Teravia'),
  icon: faGamepad,
  iconScale: 0.8
} as AppDescriptor;
