import React, { FC } from 'react';
import { Annotations } from '../../../interfaces';
import styles from './AnnotationsElement.module.scss';

export const AnnotationsElement: FC<Props> = ({ annotations }) => {
  const {
    datasetName,
    fps,
    meanRenderDuration,
    rendererType,
    viewType,
    windowCenter,
    windowWidth,
    zoom
  } = annotations;

  return (
    <>
      <div className={styles.overlayTopLeft}>
        <p>{datasetName || '-'}</p>
        <p>{viewType}</p>
      </div>
      <div className={styles.overlayTopRight}>
        <p>renderer: {rendererType || '-'}</p>
        <p>framerate: {fps ? `${fps}fps` : '-'}</p>
        <p>
          rendering:{' '}
          {meanRenderDuration ? `${meanRenderDuration.toFixed(2)}ms` : '-'}
        </p>
      </div>
      <div className={styles.overlayBottomRight}>
        <p>zoom: {zoom ? zoom.toFixed(2) : '-'}</p>
      </div>
      <div className={styles.overlayBottomLeft}>
        <p>wc: {windowCenter || '-'}</p>
        <p>ww: {windowWidth || '-'}</p>
      </div>
    </>
  );
};

interface Props {
  annotations: Annotations;
}
