import { faStickyNote } from '@fortawesome/free-solid-svg-icons/faStickyNote';
import { AppDescriptor } from '~/platform/interfaces/AppDescriptor';

export const NotesDescriptor = {
  description: 'Useless but essential.',
  factory: () => import('./Notes'),
  icon: faStickyNote,
  iconScale: 1.1,
  name: 'Notes',
} as AppDescriptor;
