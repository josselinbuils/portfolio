import cn from 'classnames';
import { type FC, useLayoutEffect, useRef } from 'preact/compat';
import { type LUTComponent } from '@/apps/DICOMViewer/interfaces/LUTComponent';
import { loadVOILUT } from '@/apps/DICOMViewer/utils/loadVOILUT';
import { useElementSize } from '@/platform/hooks/useElementSize';
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
      context.clearRect(0, 0, canvasWidth, canvasHeight);

      const lut = loadVOILUT(lutComponents, canvasWidth);

      (lut.table as number[][]).forEach((color, x) => drawLine(x, color));
    }
  }, [canvasHeight, canvasWidth, lutComponents]);

  return (
    <canvas
      className={cn(styles.barPreview, className)}
      height={canvasHeight}
      ref={canvasElementRef}
      width={canvasWidth}
    />
  );
};

interface Props {
  className?: string;
  lutComponents: LUTComponent[];
}
