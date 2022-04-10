import { faCode } from '@fortawesome/free-solid-svg-icons/faCode';
import { AppDescriptor } from '~/platform/interfaces/AppDescriptor';

export const CodeEditorDescriptor: AppDescriptor = {
  description: 'Collaborative code editor.',
  factory: () => import('./CodeEditor'),
  icon: faCode,
  iconScale: 0.85,
  isMobileFriendly: true,
  name: 'CodeEditor',
};
