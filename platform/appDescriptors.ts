import { BlogDescriptor } from '~/apps/Blog/BlogDescriptor';
import { CodeEditorDescriptor } from '~/apps/CodeEditor/CodeEditorDescriptor';
import { DICOMViewerDescriptor } from '~/apps/DICOMViewer/DICOMViewerDescriptor';
import { MP3PlayerDescriptor } from '~/apps/MP3Player/MP3PlayerDescriptor';
import { RedditDescriptor } from '~/apps/Reddit/RedditDescriptor';
import { TeraviaDescriptor } from '~/apps/Teravia/TeraviaDescriptor';
// Open executor dynamically imported in Terminal so no cycle
// eslint-disable-next-line import/no-cycle
import { TerminalDescriptor } from '~/apps/Terminal/TerminalDescriptor';

export const APP_DESCRIPTORS = [
  TerminalDescriptor,
  BlogDescriptor,
  CodeEditorDescriptor,
  DICOMViewerDescriptor,
  MP3PlayerDescriptor,
  TeraviaDescriptor,
  RedditDescriptor,
];
