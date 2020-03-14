import { faRedditAlien } from '@fortawesome/free-brands-svg-icons';
import { AppDescriptor } from '../AppDescriptor';

export const RedditDescriptor = {
  appName: 'Reddit',
  factory: () => import('./Reddit'),
  icon: faRedditAlien,
  iconScale: 1.1
} as AppDescriptor;
