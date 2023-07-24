import { type JSX } from 'preact/compat';

export interface ContextMenuItemDescriptor {
  title: string | JSX.Element;
  onClick(): void;
}
