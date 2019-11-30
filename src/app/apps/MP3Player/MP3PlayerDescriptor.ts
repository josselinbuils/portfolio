import { AppDescriptor } from '../AppDescriptor';

export const MP3PlayerDescriptor = {
  appName: 'MP3Player',
  factory: () => import('./MP3Player'),
  iconClass: 'fas fa-headphones'
} as AppDescriptor;
