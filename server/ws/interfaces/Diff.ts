export interface Diff {
  endOffset: number;
  diff: string;
  startOffset: number;
  type: '+' | '-';
}
