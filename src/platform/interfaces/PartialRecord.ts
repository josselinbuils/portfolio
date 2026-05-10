export type PartialRecord<Keys extends keyof any, Type> = Partial<
  Record<Keys, Type>
>;
