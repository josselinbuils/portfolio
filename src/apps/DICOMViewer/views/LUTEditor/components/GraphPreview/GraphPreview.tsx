import cn from 'classnames';
import React, { FC, useLayoutEffect, useRef } from 'react';
import { LUTComponent } from '~/apps/DICOMViewer/interfaces';
import { useElementSize } from '~/platform/hooks';
import styles from './GraphPreview.module.scss';

const BAR_HEIGHT = 0;
const BOTTOM_OFFSET = 5;
const LEFT_OFFSET = 5;
const RIGHT_OFFSET = 5;
const TOP_OFFSET = 5;

const PREVIEW_WIDTH = 255;
const PREVIEW_HEIGHT = 255;
const CANVAS_HEIGHT = TOP_OFFSET + PREVIEW_HEIGHT + BAR_HEIGHT + BOTTOM_OFFSET;
const CANVAS_WIDTH = LEFT_OFFSET + PREVIEW_WIDTH + RIGHT_OFFSET;

export const GraphPreview: FC<Props> = ({ className, lutComponents }) => {
  const canvasElementRef = useRef<HTMLCanvasElement>(null);
  const [canvasWidth, canvasHeight] = useElementSize(canvasElementRef);

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

      lutComponents.forEach(({ color, end, start }) => {
        const x2 = start + Math.round((end - start) / 2);
        let lastY = 0;

        for (let x = start; x <= end; x++) {
          const y =
            PREVIEW_HEIGHT -
            Math.round(
              ((x - start) * (x - end) * PREVIEW_HEIGHT) /
                ((x2 - start) * (x2 - end))
            );

          if (x > start) {
            drawLine(
              x - 1,
              lastY,
              x,
              y,
              `rgb(${color[0]}, ${color[1]}, ${color[2]}`
            );
          }
          lastY = y;
        }
      });
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
