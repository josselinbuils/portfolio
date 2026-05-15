export function computeFitCanvasSize(viewport: HTMLElement): {
  height: number;
  width: number;
} {
  const computedStyle = window.getComputedStyle(viewport);

  const width = Math.floor(
    viewport.clientWidth -
      parseFloat(computedStyle.paddingLeft) -
      parseFloat(computedStyle.paddingRight),
  );

  const height = Math.floor(
    viewport.clientHeight -
      parseFloat(computedStyle.paddingTop) -
      parseFloat(computedStyle.paddingBottom),
  );

  return {
    height: Math.max(height, 1),
    width: Math.max(width, 1),
  };
}
