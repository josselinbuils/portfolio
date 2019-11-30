import { AppDescriptor } from '../AppDescriptor';

export const RedditDescriptor = {
  appName: 'Reddit',
  factory: () => import('./Reddit'),
  iconClass: 'fab fa-reddit-alien'
} as AppDescriptor;
