export function getSize(
  element: HTMLElement | null
): { width: number; height: number } {
  let width = 0;
  let height = 0;

  if (element !== null) {
    width = element.clientWidth;
    height = element.clientHeight;
  }
  return { height, width };
}
