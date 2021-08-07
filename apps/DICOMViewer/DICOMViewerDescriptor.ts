import { faHeartbeat } from '@fortawesome/free-solid-svg-icons/faHeartbeat';
import { AppDescriptor } from '~/platform/interfaces/AppDescriptor';

export const DICOMViewerDescriptor = {
  description: 'Medical image viewer.',
  factory: () => import('./DICOMViewer'),
  icon: faHeartbeat,
  name: 'DICOMViewer',
} as AppDescriptor;
