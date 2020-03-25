import cn from 'classnames';
import React, { FC, useLayoutEffect, useRef } from 'react';
import { LUTComponent } from '~/apps/DICOMViewer/interfaces';
import { loadVOILUT } from '~/apps/DICOMViewer/utils';
import { useElementSize } from '~/platform/hooks';

import styles from './BarPreview.module.scss';

export const BarPreview: FC<Props> = ({ className, lutComponents }) => {
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
      context.clearRect(0, 0, canvasWidth - 1, canvasHeight - 1);

      const lut = loadVOILUT(lutComponents, canvasWidth);

      (lut.table as number[][]).forEach((color, x) => drawLine(x, color));
    }
  }, [canvasHeight, canvasWidth, lutComponents]);

  return (
    <div className={cn(styles.barPreview, className)}>
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
