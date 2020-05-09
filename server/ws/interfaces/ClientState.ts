import { ClientCursor } from './ClientCursor';

export interface ClientState {
  code: string;
  cursorColor: string;
  cursors: ClientCursor[];
  id: number;
}
