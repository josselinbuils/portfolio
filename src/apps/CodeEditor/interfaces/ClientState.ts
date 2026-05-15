import { type ClientCursor } from './ClientCursor';
import { type EditableState } from './EditableState';

export type ClientState = EditableState & {
  cursorColor: string;
  cursors: ClientCursor[];
  id: number;
};
