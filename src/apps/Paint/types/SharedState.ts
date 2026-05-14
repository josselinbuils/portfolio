export type Selection = {
  height: number;
  imageData: ImageData | null;
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
