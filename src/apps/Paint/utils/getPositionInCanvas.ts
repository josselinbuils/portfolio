export function getPositionInCanvas(
  event: MouseEvent,
  canvas: HTMLCanvasElement,
): { x: number; y: number } {
  const canvasRect = canvas.getBoundingClientRect();
  return {
    x: Math.round(
      (event.clientX - canvasRect.left) * (canvas.width / canvasRect.width),
    ),
    y: Math.round(
      (event.clientY - canvasRect.top) * (canvas.height / canvasRect.height),
    ),
  };
}
