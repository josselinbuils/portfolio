import { type Selection } from './Selection';

export interface ClientCursor {
  clientID: number;
  color: string;
  selection: Selection;
}
