import React, { FC, useEffect, useRef, useState } from 'react';
import { ViewportElement } from '~/apps/DICOMViewer/components';
import {
  MouseTool,
  RendererType,
  ViewType
} from '~/apps/DICOMViewer/constants';
import { LUTComponent } from '~/apps/DICOMViewer/interfaces';
import { Dataset, Viewport } from '~/apps/DICOMViewer/models';
import { startTool } from '~/apps/DICOMViewer/utils';
import { GraphPreview } from './components';
import { BarPreview } from './components';
import styles from './LUTEditor.module.scss';

const baseLUTComponents = [
  { id: '0', start: 0, end: 65, color: [0, 0, 255] },
  { id: '1', start: 45, end: 150, color: [0, 255, 0] },
  { id: '2', start: 130, end: 255, color: [255, 0, 0] }
] as LUTComponent[];

export const LUTEditor: FC<Props> = ({ dataset, onError, rendererType }) => {
  const [activeLUTComponentID, setActiveLUTComponentID] = useState<string>();
  const [lutComponents, setLUTComponents] = useState<LUTComponent[]>(
    baseLUTComponents
  );
  const [viewport, setViewport] = useState<Viewport>();
  const viewportElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (dataset !== undefined && rendererType !== undefined) {
      try {
        setViewport(Viewport.create(dataset, ViewType.Native));
      } catch (error) {
        onError('Unable to create viewport');
        console.error(error);
      }
    }
  }, [dataset, onError, rendererType]);

  useEffect(() => {
    setViewport(currentViewport => {
      if (currentViewport !== undefined) {
        return currentViewport.clone({ lutComponents });
      }
    });
  }, [lutComponents]);

  if (!viewport) {
    return null;
  }

  function lutComponentDragHandler(
    downEvent: MouseEvent,
    previewWidth: number,
    componentId: string
  ): void {
    const targetLUTComponent = lutComponents.find(
      ({ id }) => id === componentId
    );

    if (targetLUTComponent === undefined) {
      throw new Error('Unable to find target LUT component');
    }

    setActiveLUTComponentID(componentId);

    const baseStart = targetLUTComponent.start;
    const baseEnd = targetLUTComponent.end;
    const lutComponentWidth = baseEnd - baseStart;

    function mouseMoveListener(moveEvent: MouseEvent): void {
      const offset = Math.round(
        ((moveEvent.clientX - downEvent.clientX) / previewWidth) * 256
      );
      let newStart = baseStart + offset;
      let newEnd = baseEnd + offset;

      if (newStart < 0) {
        newStart = 0;
        newEnd = lutComponentWidth;
      } else if (newEnd > 255) {
        newEnd = 255;
        newStart = newEnd - lutComponentWidth;
      }

      (targetLUTComponent as LUTComponent).start = newStart;
      (targetLUTComponent as LUTComponent).end = newEnd;
      setLUTComponents([...baseLUTComponents]);
    }

    function mouseUpListener(): void {
      window.removeEventListener('mousemove', mouseMoveListener);
      window.removeEventListener('mouseup', mouseUpListener);
      setActiveLUTComponentID(undefined);
    }

    window.addEventListener('mousemove', mouseMoveListener);
    window.addEventListener('mouseup', mouseUpListener);
  }

  return (
    <>
      <div className={styles.leftPan}>
        <ViewportElement
          className={styles.viewport}
          onCanvasMouseDown={downEvent => {
            console.log('startToo');
            startTool(
              downEvent,
              viewport as Viewport,
              viewportElementRef,
              MouseTool.Paging
            );
          }}
          onError={onError}
          ref={viewportElementRef}
          rendererType={rendererType}
          viewport={viewport}
        />
        <BarPreview
          className={styles.barPreview}
          lutComponents={lutComponents}
        />
      </div>
      <div className={styles.rightPan}>
        <GraphPreview
          activeLUTComponentID={activeLUTComponentID}
          className={styles.preview}
          lutComponents={lutComponents}
          onLUTComponentDrag={lutComponentDragHandler}
        />
      </div>
    </>
  );
};

interface Props {
  dataset: Dataset;
  rendererType: RendererType;
  onError(message: string): void;
}
