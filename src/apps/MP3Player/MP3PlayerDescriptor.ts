import { faHeadphones } from '@fortawesome/free-solid-svg-icons/faHeadphones';
import { type AppDescriptor } from '@/platform/interfaces/AppDescriptor';

export const MP3PlayerDescriptor: AppDescriptor = {
  description: 'Royalty free music player.',
  factory: () => import('./MP3Player'),
  icon: faHeadphones,
  name: 'MP3Player',
};
