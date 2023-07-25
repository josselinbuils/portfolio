import { type JSX } from 'preact/compat';

export interface MenuItemDescriptor {
  title: string | JSX.Element;
  onClick(): void;
}
