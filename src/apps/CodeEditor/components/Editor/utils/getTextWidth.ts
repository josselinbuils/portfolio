const SAFETY_MARGIN_PX = 2;

let context: CanvasRenderingContext2D | null | undefined;

export function getTextWidth(text: string, font: string): number {
  if (!context) {
    const canvas = document.createElement('canvas');
    context = canvas.getContext('2d');
  }
  if (context === null) {
    return 0;
  }
  context.font = font;

  return Math.ceil(context.measureText(text).width) + SAFETY_MARGIN_PX;
}
