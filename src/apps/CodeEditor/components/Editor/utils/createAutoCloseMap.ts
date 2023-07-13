export function createAutoCLoseMap(groups: string[]): {
  [openChar: string]: string;
} {
  const map: { [openChar: string]: string } = {};

  groups.forEach((group) => {
    map[group[0]] = group[1];
  });

  return map;
}
