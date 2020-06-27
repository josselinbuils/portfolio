import { faHeadphones } from '@fortawesome/free-solid-svg-icons/faHeadphones';
import { AppDescriptor } from '~/platform/interfaces/AppDescriptor';

export const MP3PlayerDescriptor = {
  appName: 'MP3Player',
  factory: () => import('./MP3Player'),
  icon: faHeadphones,
} as AppDescriptor;
