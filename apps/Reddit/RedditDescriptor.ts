import { faRedditAlien } from '@fortawesome/free-brands-svg-icons/faRedditAlien';
import { AppDescriptor } from '~/platform/interfaces/AppDescriptor';

export const RedditDescriptor: AppDescriptor = {
  description: 'Reddit content reader.',
  factory: () => import('./Reddit'),
  icon: faRedditAlien,
  iconScale: 1.1,
  isMobileFriendly: false,
  name: 'Reddit',
};
