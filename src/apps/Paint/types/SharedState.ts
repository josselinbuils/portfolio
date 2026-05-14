export type Selection = {
  boundary?: Path2D; // traced outline path for non-rectangular selections
  height: number;
  imageData: ImageData | null;
  mask?: Uint8Array; // full-canvas pixel mask (1 = selected) for non-rectangular selections
  width: number;
  x: number;
  y: number;
};

export type SharedState = {
  fillColor: string;
  fillOn: boolean;
  selection: Selection | null;
  strokeColor: string;
  tolerance: number;
  width: number;
};
