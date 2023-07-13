const SAFETY_MARGIN_PX = 2;

export function getTextWidth(text: string, font: string): number {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (context === null) {
    return 0;
  }
  context.font = font;

  return Math.ceil(context.measureText(text).width) + SAFETY_MARGIN_PX;
}
