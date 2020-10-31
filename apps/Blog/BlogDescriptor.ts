import { faBlog } from '@fortawesome/free-solid-svg-icons/faBlog';
import { AppDescriptor } from '~/platform/interfaces/AppDescriptor';

export const BlogDescriptor = {
  appName: 'Blog',
  factory: () => import('./Blog'),
  icon: faBlog,
} as AppDescriptor;
