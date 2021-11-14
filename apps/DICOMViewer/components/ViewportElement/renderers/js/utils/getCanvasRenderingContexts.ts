export function getCanvasRenderingContexts(canvas: HTMLCanvasElement): {
  context: CanvasRenderingContext2D;
  renderingContext: CanvasRenderingContext2D;
} {
  const context = canvas.getContext('2d');
  const renderingContext = (
    document.createElement('canvas') as HTMLCanvasElement
  ).getContext('2d');

  if (context === null || renderingContext === null) {
    throw new Error('Unable to retrieve contexts');
  }

  return { context, renderingContext };
}
