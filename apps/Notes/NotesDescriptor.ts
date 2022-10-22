import { faStickyNote } from '@fortawesome/free-solid-svg-icons/faStickyNote';
import type { AppDescriptor } from '~/platform/interfaces/AppDescriptor';

export const NotesDescriptor: AppDescriptor = {
  description: 'Useless but essential.',
  factory: () => import('./Notes'),
  icon: faStickyNote,
  iconScale: 1.1,
  isMobileFriendly: true,
  name: 'Notes',
};
