export function getWidthWithoutPadding(element: HTMLElement | null): number {
  if (element === null) {
    return 0;
  }
  const { paddingLeft, paddingRight } = window.getComputedStyle(element, null);
  return (
    element.clientWidth - parseFloat(paddingLeft) - parseFloat(paddingRight)
  );
}
