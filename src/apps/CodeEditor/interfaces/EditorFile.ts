import { type JSX } from 'preact';

import { type SupportedLanguage } from './SupportedLanguage';

export type EditorFile = {
  content: string;
  language: SupportedLanguage;
  name: string;
  shared: boolean;
  SideComponent?: JSX.ElementType;
};
