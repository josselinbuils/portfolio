import { BlogDescriptor } from '~/apps/Blog/BlogDescriptor';
import { CodeEditorDescriptor } from '~/apps/CodeEditor/CodeEditorDescriptor';
import { DICOMViewerDescriptor } from '~/apps/DICOMViewer/DICOMViewerDescriptor';
import { MP3PlayerDescriptor } from '~/apps/MP3Player/MP3PlayerDescriptor';
import { NotesDescriptor } from '~/apps/Notes/NotesDescriptor';
import { RedditDescriptor } from '~/apps/Reddit/RedditDescriptor';
import { TeraviaDescriptor } from '~/apps/Teravia/TeraviaDescriptor';
import { TerminalDescriptor } from '~/apps/Terminal/TerminalDescriptor';

export const APP_DESCRIPTORS = [
  TerminalDescriptor,
  BlogDescriptor,
  CodeEditorDescriptor,
  DICOMViewerDescriptor,
  MP3PlayerDescriptor,
  TeraviaDescriptor,
  RedditDescriptor,
  NotesDescriptor,
];
