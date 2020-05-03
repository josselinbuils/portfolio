import { ClientCursor } from './ClientCursor';

export interface ClientState {
  clientID: number;
  code: string;
  cursorColor: string;
  cursors: ClientCursor[];
}
