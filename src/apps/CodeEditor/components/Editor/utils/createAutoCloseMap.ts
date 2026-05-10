export function createAutoCLoseMap(groups: string[]): Record<string, string> {
  const map: Record<string, string> = {};

  groups.forEach((group) => {
    map[group[0]] = group[1];
  });

  return map;
}
