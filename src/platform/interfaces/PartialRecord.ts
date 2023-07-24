export type PartialRecord<Keys extends keyof any, Type> = {
  [Key in Keys]?: Type;
};
