import { faCheck } from '@fortawesome/free-solid-svg-icons';
import React, { FC, useRef } from 'react';
import { useContextMenu } from '~/platform/providers/ContextMenuProvider';
import { ViewType } from '../../../../constants';
import { Annotations } from '../../Annotations';
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
        <p className={styles.annotation}>{datasetName || '-'}</p>
        <p
          className={styles.annotation}
          onClick={showViewTypeMenu}
          ref={viewTypeElementRef}
        >
          {viewType}
        </p>
      </div>
      <div className={styles.overlayTopRight}>
        <p className={styles.annotation}>renderer: {rendererType || '-'}</p>
        <p className={styles.annotation}>
          framerate: {fps ? `${fps}fps` : '-'}
        </p>
        <p className={styles.annotation}>
          rendering:{' '}
          {meanRenderDuration ? `${meanRenderDuration.toFixed(2)}ms` : '-'}
        </p>
      </div>
      <div className={styles.overlayBottomRight}>
        <p className={styles.annotation}>
          zoom: {zoom ? zoom.toFixed(2) : '-'}
        </p>
      </div>
      <div className={styles.overlayBottomLeft}>
        <p className={styles.annotation}>wc: {windowCenter || '-'}</p>
        <p className={styles.annotation}>ww: {windowWidth || '-'}</p>
      </div>
    </>
  );
};

interface Props {
  annotations: Annotations;
  availableViewTypes: ViewType[];
  onViewTypeSwitch(viewType: ViewType): void;
}
