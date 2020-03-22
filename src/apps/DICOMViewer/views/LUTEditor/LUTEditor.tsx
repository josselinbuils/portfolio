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

const lutComponents = [
  { start: 0, end: 65, color: [0, 0, 255] },
  { start: 45, end: 150, color: [0, 255, 0] },
  { start: 130, end: 255, color: [255, 0, 0] }
] as LUTComponent[];

export const LUTEditor: FC<Props> = ({ dataset, onError, rendererType }) => {
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

  if (!viewport) {
    return null;
  }

  return (
    <>
      <div className={styles.leftPan}>
        <ViewportElement
          className={styles.viewport}
          lutComponents={lutComponents}
          onCanvasMouseDown={downEvent =>
            startTool(
              downEvent,
              viewport as Viewport,
              viewportElementRef,
              MouseTool.Paging
            )
          }
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
          className={styles.preview}
          lutComponents={lutComponents}
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
