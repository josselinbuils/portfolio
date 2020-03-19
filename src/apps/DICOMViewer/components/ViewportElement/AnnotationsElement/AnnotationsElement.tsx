import { faCheck } from '@fortawesome/free-solid-svg-icons';
import React, { FC, useRef } from 'react';
import { ViewType } from '~/apps/DICOMViewer/constants';
import { useContextMenu } from '~/platform/providers/ContextMenuProvider';
import { Annotations } from '../../../interfaces';
import styles from './AnnotationsElement.module.scss';

export const AnnotationsElement: FC<Props> = ({
  annotations,
  availableViewTypes,
  onViewTypeSwitch
}) => {
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
  const showMenu = useContextMenu();
  const viewTypeElementRef = useRef<HTMLParagraphElement>(null);

  const showViewTypeMenu = () => {
    if (viewTypeElementRef.current === null) {
      return;
    }
    const { bottom, left } = viewTypeElementRef.current.getBoundingClientRect();

    const items = availableViewTypes.map(type => ({
      icon: type === annotations.viewType ? faCheck : undefined,
      title: type as string,
      onClick: () => onViewTypeSwitch(type)
    }));

    showMenu({
      items,
      position: {
        x: left,
        y: bottom + 5
      },
      style: {
        background: 'black',
        border: '1px solid white'
      }
    });
  };

  return (
    <>
      <div className={styles.overlayTopLeft}>
        <p>{datasetName || '-'}</p>
        <p onClick={showViewTypeMenu} ref={viewTypeElementRef}>
          {viewType}
        </p>
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
  availableViewTypes: ViewType[];
  onViewTypeSwitch(viewType: ViewType): void;
}
