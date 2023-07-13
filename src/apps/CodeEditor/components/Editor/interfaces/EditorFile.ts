import { type JSX } from 'preact/compat';

export interface EditorFile {
  content: string;
  language: string;
  name: string;
  shared: boolean;
  SideComponent?: JSX.ElementType;
}
