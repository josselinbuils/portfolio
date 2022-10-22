import { faBlog } from '@fortawesome/free-solid-svg-icons/faBlog';
import type { AppDescriptor } from '~/platform/interfaces/AppDescriptor';

export const BlogDescriptor: AppDescriptor = {
  description: 'Stuff I want to share.',
  factory: () => import('./Blog'),
  icon: faBlog,
  isMobileFriendly: true,
  name: 'Blog',
};
