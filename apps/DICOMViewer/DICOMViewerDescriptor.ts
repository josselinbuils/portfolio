import { faHeartbeat } from '@fortawesome/free-solid-svg-icons/faHeartbeat';
import type { AppDescriptor } from '~/platform/interfaces/AppDescriptor';

export const DICOMViewerDescriptor: AppDescriptor = {
  description: 'Medical image viewer.',
  factory: () => import('./DICOMViewer'),
  icon: faHeartbeat,
  isMobileFriendly: false,
  name: 'DICOMViewer',
};
