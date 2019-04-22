export function getOrientation(): string {
  return window.innerHeight > window.innerWidth ? 'portrait' : 'landscape';
}
