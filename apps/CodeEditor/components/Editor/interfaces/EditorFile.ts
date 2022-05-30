import { ComponentType } from 'react';

export interface EditorFile {
  content: string;
  language: string;
  name: string;
  SideComponent?: ComponentType;
}
