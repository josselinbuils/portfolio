import { faBlog } from '@fortawesome/free-solid-svg-icons/faBlog';
import { AppDescriptor } from '~/platform/interfaces/AppDescriptor';

export const BlogDescriptor = {
  description: 'Stuff I want to share.',
  factory: () => import('./Blog'),
  icon: faBlog,
  name: 'Blog',
} as AppDescriptor;
