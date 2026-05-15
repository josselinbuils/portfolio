import cn from 'classnames';
import { type FunctionComponent } from 'preact';
import { useLayoutEffect, useRef } from 'preact/hooks';

import { type LUTComponent } from '@/apps/DICOMViewer/interfaces/LUTComponent';
import { loadVOILUT } from '@/apps/DICOMViewer/utils/loadVOILUT';
import { useElementSize } from '@/platform/hooks/useElementSize';

import classes from './BarPreview.module.css';

export type BarPreviewProps = {
  className?: string;
  lutComponents: LUTComponent[];
};

export const BarPreview: FunctionComponent<BarPreviewProps> = ({
  className,
  lutComponents,
}) => {
  const canvasElementRef = useRef<HTMLCanvasElement>(null);
  const [canvasWidth, canvasHeight] = useElementSize(canvasElementRef);

  useLayoutEffect(() => {
    const canvasElement = canvasElementRef.current as HTMLCanvasElement;
    const context = canvasElement.getContext('2d');

    function drawLine(x: number, color: number[]): void {
      if (context === null) {
        return;
      }
      context.beginPath();
      context.moveTo(x, 0);
      context.lineTo(x, canvasHeight - 1);
      context.lineWidth = 2;
      context.strokeStyle = `rgb(${color})`;
      context.stroke();
    }

    if (context !== null) {
      context.clearRect(0, 0, canvasWidth, canvasHeight);

      const lut = loadVOILUT(lutComponents, canvasWidth);

      (lut.table as number[][]).forEach((color, x) => drawLine(x, color));
    }
  }, [canvasHeight, canvasWidth, lutComponents]);

  return (
    <canvas
      className={cn(classes.barPreview, className)}
      height={canvasHeight}
      ref={canvasElementRef}
      width={canvasWidth}
    />
  );
};
