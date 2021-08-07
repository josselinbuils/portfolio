import { faRedditAlien } from '@fortawesome/free-brands-svg-icons/faRedditAlien';
import { AppDescriptor } from '~/platform/interfaces/AppDescriptor';

export const RedditDescriptor = {
  description: 'Reddit content reader.',
  factory: () => import('./Reddit'),
  icon: faRedditAlien,
  iconScale: 1.1,
  name: 'Reddit',
} as AppDescriptor;
