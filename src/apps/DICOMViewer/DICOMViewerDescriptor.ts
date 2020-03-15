import { faHeartbeat } from '@fortawesome/free-solid-svg-icons';
import { AppDescriptor } from '../AppDescriptor';

export const DICOMViewerDescriptor = {
  appName: 'DICOMViewer',
  factory: () => import('./DICOMViewer'),
  icon: faHeartbeat
} as AppDescriptor;
