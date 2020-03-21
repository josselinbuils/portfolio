import cn from 'classnames';
import React, { FC, useLayoutEffect, useRef, useState } from 'react';
import { LUTComponent } from '../../../../interfaces';
import styles from './LUTPreview.module.scss';

const BAR_HEIGHT = 30;
const BOTTOM_OFFSET = 5;
const LEFT_OFFSET = 5;
const RIGHT_OFFSET = 5;
const TOP_OFFSET = 5;

const PREVIEW_WIDTH = 255;
const PREVIEW_HEIGHT = 255;
const CANVAS_HEIGHT = TOP_OFFSET + PREVIEW_HEIGHT + BAR_HEIGHT + BOTTOM_OFFSET;
const CANVAS_WIDTH = LEFT_OFFSET + PREVIEW_WIDTH + RIGHT_OFFSET;

export const LUTPreview: FC<Props> = ({ className, lutComponents }) => {
  const [canvasHeight, setCanvasHeight] = useState(0);
  const [canvasWidth, setCanvasWidth] = useState(0);
  const canvasElementRef = useRef<HTMLCanvasElement>(null);

  useLayoutEffect(() => {
    const canvasElement = canvasElementRef.current as HTMLCanvasElement;
    const observer = new ResizeObserver(([{ contentRect }]) => {
      setCanvasHeight(Math.round(contentRect.height));
      setCanvasWidth(Math.round(contentRect.width));
    });
    observer.observe(canvasElement);
    return () => observer.disconnect();
  }, []);

  useLayoutEffect(() => {
    const canvasElement = canvasElementRef.current as HTMLCanvasElement;
    const context = canvasElement.getContext('2d');

    function drawLine(
      x0: number,
      y0: number,
      x1: number,
      y1: number,
      color: string,
      lineWidth: number = 2
    ): void {
      if (context === null) {
        return;
      }
      context.beginPath();
      context.moveTo(
        Math.floor(((x0 + LEFT_OFFSET) * canvasWidth) / CANVAS_WIDTH),
        Math.floor(((y0 + TOP_OFFSET) * canvasHeight) / CANVAS_HEIGHT)
      );
      context.lineTo(
        Math.floor(((x1 + LEFT_OFFSET) * canvasWidth) / CANVAS_WIDTH),
        Math.floor(((y1 + TOP_OFFSET) * canvasHeight) / CANVAS_HEIGHT)
      );
      context.lineWidth = lineWidth;
      context.strokeStyle = color;
      context.stroke();
    }

    if (context !== null) {
      context.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

      for (let x = 0; x < 256; x++) {
        const pixelValue = [0, 0, 0];

        lutComponents
          .filter(({ start, end }) => x - 1 >= start && x <= end)
          .forEach(({ color, end, start }) => {
            const x2 = start + Math.round((end - start) / 2);
            const colorValue = Math.round(
              ((x - start) * (x - end) * 255) / ((x2 - start) * (x2 - end))
            );
            const y = 255 - colorValue;

            if (x > start) {
              const prevY =
                255 -
                Math.round(
                  ((x - 1 - start) * (x - 1 - end) * 255) /
                    ((x2 - start) * (x2 - end))
                );
              drawLine(
                x - 1,
                prevY,
                x,
                y,
                `rgb(${color[0]}, ${color[1]}, ${color[2]}`
              );
            }

            pixelValue[0] += Math.floor((color[0] / 255) * colorValue);
            pixelValue[1] += Math.floor((color[1] / 255) * colorValue);
            pixelValue[2] += Math.floor((color[2] / 255) * colorValue);
          });

        drawLine(
          x,
          PREVIEW_HEIGHT,
          x,
          PREVIEW_HEIGHT + BAR_HEIGHT,
          `rgba(${pixelValue[0]}, ${pixelValue[1]}, ${pixelValue[2]}, 0.8)`,
          10
        );
      }
    }
  }, [canvasHeight, canvasWidth, lutComponents]);

  return (
    <div className={cn(styles.preview, className)}>
      <canvas
        height={canvasHeight}
        ref={canvasElementRef}
        width={canvasWidth}
      />
    </div>
  );
};

interface Props {
  className: string;
  lutComponents: LUTComponent[];
}
