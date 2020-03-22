import cn from 'classnames';
import React, { FC, useLayoutEffect, useRef } from 'react';
import { LUTComponent } from '~/apps/DICOMViewer/interfaces';
import { scaleLUTComponents } from '~/apps/DICOMViewer/utils';
import { applyPolynomialInterpolation } from '~/apps/DICOMViewer/utils/math';
import { useElementSize } from '~/platform/hooks';
import styles from './GraphPreview.module.scss';

const BOTTOM_OFFSET = 5;
const LEFT_OFFSET = 5;
const RIGHT_OFFSET = 5;
const TOP_OFFSET = 5;
const GRAPH_LINE_OFFSET = 10;

export const GraphPreview: FC<Props> = ({
  className,
  lutComponents,
  onLUTComponentDrag
}) => {
  const canvasElementRef = useRef<HTMLCanvasElement>(null);
  const [canvasWidth, canvasHeight] = useElementSize(canvasElementRef);
  const previewWidth =
    canvasWidth - LEFT_OFFSET - GRAPH_LINE_OFFSET - RIGHT_OFFSET;
  const previewHeight =
    canvasHeight - TOP_OFFSET - GRAPH_LINE_OFFSET - BOTTOM_OFFSET;

  useLayoutEffect(() => {
    const canvasElement = canvasElementRef.current as HTMLCanvasElement;
    const context = canvasElement.getContext('2d');

    function getX(x: number): number {
      return x + LEFT_OFFSET;
    }

    function getY(y: number): number {
      return y + GRAPH_LINE_OFFSET + TOP_OFFSET;
    }

    function drawLine(
      x0: number,
      y0: number,
      x1: number,
      y1: number,
      color: string = 'lightgrey',
      lineWidth: number = 2
    ): void {
      if (context === null) {
        return;
      }
      context.beginPath();
      context.moveTo(getX(x0), getY(y0));
      context.lineTo(getX(x1), getY(y1));
      context.lineWidth = lineWidth;
      context.strokeStyle = color;
      context.stroke();
    }

    if (context !== null) {
      context.clearRect(0, 0, canvasWidth, canvasHeight);

      scaleLUTComponents(lutComponents, previewWidth).forEach(
        ({ color, end, start }) => {
          let lastY = 0;

          for (let x = start; x <= end; x++) {
            const y =
              previewHeight -
              applyPolynomialInterpolation(start, end, previewHeight, x);

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
        }
      );

      drawLine(-1, -GRAPH_LINE_OFFSET, -1, previewHeight + 1);

      context.beginPath();
      context.moveTo(getX(-1), getY(-GRAPH_LINE_OFFSET - 3));
      context.lineTo(getX(-4), getY(-GRAPH_LINE_OFFSET + 1));
      context.lineTo(getX(2), getY(-GRAPH_LINE_OFFSET + 1));
      context.closePath();
      context.fillStyle = 'lightgrey';
      context.fill();

      drawLine(
        -1,
        previewHeight + 1,
        previewWidth + GRAPH_LINE_OFFSET,
        previewHeight + 1
      );

      context.beginPath();
      context.moveTo(
        getX(previewWidth + GRAPH_LINE_OFFSET + 3),
        getY(previewHeight + 1)
      );
      context.lineTo(
        getX(previewWidth + GRAPH_LINE_OFFSET - 1),
        getY(previewHeight - 2)
      );
      context.lineTo(
        getX(previewWidth + GRAPH_LINE_OFFSET - 1),
        getY(previewHeight + 4)
      );
      context.closePath();
      context.fillStyle = 'lightgrey';
      context.fill();
    }
  }, [canvasHeight, canvasWidth, lutComponents, previewHeight, previewWidth]);

  function handleMouseDown(downEvent: React.MouseEvent): void {
    const downX = downEvent.nativeEvent.offsetX - LEFT_OFFSET - 1;
    const downY = canvasHeight - downEvent.nativeEvent.offsetY - BOTTOM_OFFSET;

    const closeLUTComponent = scaleLUTComponents(lutComponents, previewWidth)
      .filter(({ end, start }) => downX >= start && downX <= end)
      .find(({ end, start }) => {
        const y = applyPolynomialInterpolation(
          start,
          end,
          previewHeight,
          downX
        );
        return Math.abs(downY - y) < 10;
      });

    if (closeLUTComponent !== undefined) {
      onLUTComponentDrag(downEvent.nativeEvent, closeLUTComponent.id);
    }
  }

  return (
    <div className={cn(styles.preview, className)}>
      <canvas
        height={canvasHeight}
        onMouseDown={handleMouseDown}
        ref={canvasElementRef}
        width={canvasWidth}
      />
    </div>
  );
};

interface Props {
  className: string;
  lutComponents: LUTComponent[];
  onLUTComponentDrag(downEvent: MouseEvent, componentId: string): void;
}
