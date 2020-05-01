export function spliceString(
  str: string,
  start: number,
  deleteCount: number = 0,
  strToInsert: string = ''
): string {
  const chars = str.split('');
  chars.splice(start, deleteCount, strToInsert);
  return chars.join('');
}
