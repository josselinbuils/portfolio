import { AppDescriptor } from '../AppDescriptor';

export const NotesDescriptor = {
  appName: 'Notes',
  factory: () => import('./Notes'),
  iconClass: 'fas fa-sticky-note'
} as AppDescriptor;
