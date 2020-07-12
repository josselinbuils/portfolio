export function spliceString(
  str: string,
  start: number,
  deleteCount = 0,
  strToInsert = ''
): string {
  const chars = str.split('');
  chars.splice(start, deleteCount, strToInsert);
  return chars.join('');
}
