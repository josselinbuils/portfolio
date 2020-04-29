export interface Diff {
  cursorOffsetAfter?: number;
  endOffset: number;
  diff: string;
  startOffset: number;
  type: '+' | '-';
}
