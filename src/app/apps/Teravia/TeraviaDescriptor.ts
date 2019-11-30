import { AppDescriptor } from '../AppDescriptor';

export const TeraviaDescriptor = {
  appName: 'Teravia',
  factory: () => import('./Teravia'),
  iconClass: 'fas fa-gamepad'
} as AppDescriptor;
