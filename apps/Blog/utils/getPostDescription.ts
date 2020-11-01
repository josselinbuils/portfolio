export function getPostDescription(content: string): string {
  return (content.match(/^#.*\n+(([^#])+)\n##/)?.[1] ?? '')
    .replace(/\n/g, ' ')
    .trim();
}
