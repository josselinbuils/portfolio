import { faStickyNote } from '@fortawesome/free-solid-svg-icons/faStickyNote';
import { AppDescriptor } from '../AppDescriptor';

export const NotesDescriptor = {
  appName: 'Notes',
  factory: () => import('./Notes'),
  icon: faStickyNote,
  iconScale: 1.1,
} as AppDescriptor;
