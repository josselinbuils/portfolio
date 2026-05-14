export function getCanvasContext(canvas: HTMLCanvasElement) {
  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('Unable to get canvas context');
  }
  return context;
}
