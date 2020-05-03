import { EditableState } from '../../../interfaces';
import { ClientCursor } from './ClientCursor';

export interface ClientState extends EditableState {
  clientID: number;
  cursorColor: string;
  cursors: ClientCursor[];
}
