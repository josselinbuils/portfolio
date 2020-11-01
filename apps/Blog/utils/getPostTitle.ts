export function getPostTitle(content: string): string {
  return content.match(/^# (.+)$/m)?.[1] ?? '';
}
