import { faCode } from '@fortawesome/free-solid-svg-icons/faCode';
import { AppDescriptor } from '~/platform/interfaces/AppDescriptor';

export const CodeEditorDescriptor = {
  appName: 'CodeEditor',
  factory: () => import('./CodeEditor'),
  icon: faCode,
  iconScale: 0.85,
} as AppDescriptor;
