import { Diff } from './Diff';

export interface Change {
  cursorOffsetAfter: number;
  diffObj: Diff | Diff[];
  newCode: string;
}
