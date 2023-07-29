import { type JSX } from 'preact/compat';
import { type SupportedLanguage } from './SupportedLanguage';

export interface EditorFile {
  content: string;
  language: SupportedLanguage;
  name: string;
  shared: boolean;
  SideComponent?: JSX.ElementType;
}
