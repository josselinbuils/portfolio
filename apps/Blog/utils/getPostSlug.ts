export function getPostSlug(path: string): string {
  return path.replace(/^.*[\\/]/g, '').slice(0, -3);
}
