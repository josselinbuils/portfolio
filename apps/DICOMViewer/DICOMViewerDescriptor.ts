import { faHeartbeat } from '@fortawesome/free-solid-svg-icons/faHeartbeat';
import { AppDescriptor } from '~/platform/interfaces/AppDescriptor';

export const DICOMViewerDescriptor = {
  appName: 'DICOMViewer',
  factory: () => import('./DICOMViewer'),
  icon: faHeartbeat,
} as AppDescriptor;
