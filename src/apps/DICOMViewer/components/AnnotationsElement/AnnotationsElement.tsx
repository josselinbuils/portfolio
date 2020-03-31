import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';
import React, { FC, RefObject, useRef } from 'react';
import { RendererType, ViewType } from '~/apps/DICOMViewer/constants';
import { ContextMenuItemDescriptor } from '~/platform/components/ContextMenu';
import { useContextMenu } from '~/platform/providers/ContextMenuProvider';
import { Annotations } from '../../interfaces';

import styles from './AnnotationsElement.module.scss';

export const AnnotationsElement: FC<Props> = ({
  annotations,
  availableViewTypes,
  onRendererTypeSwitch,
  onViewTypeSwitch,
}) => {
  const {
    datasetName,
    fps,
    meanRenderDuration,
    rendererType,
    viewType,
    windowCenter,
    windowWidth,
    zoom,
  } = annotations;
  const showMenu = useContextMenu();
  const rendererElementRef = useRef<HTMLSpanElement>(null);
  const viewTypeElementRef = useRef<HTMLParagraphElement>(null);

  function getMenuItemIcon(isItemActive: boolean): IconDefinition | undefined {
    return isItemActive ? faCheck : undefined;
  }

  function showContextMenu(
    elementRef: RefObject<HTMLElement>,
    items: ContextMenuItemDescriptor[]
  ): void {
    if (elementRef.current === null) {
      return;
    }
    const { bottom, left } = elementRef.current.getBoundingClientRect();

    showMenu({
      className: styles.contextMenu,
      items,
      position: {
        x: left,
        y: bottom + 5,
      },
    });
  }

  function showRendererTypeMenu(): void {
    const items = [RendererType.JavaScript, RendererType.WebGL].map((type) => ({
      icon: getMenuItemIcon(type === rendererType),
      title: type,
      onClick: () => onRendererTypeSwitch(type),
    }));
    showContextMenu(rendererElementRef, items);
  }

  function showViewTypeMenu(): void {
    const items = availableViewTypes.map((type) => ({
      icon: getMenuItemIcon(type === annotations.viewType),
      title: type,
      onClick: () => onViewTypeSwitch(type),
    }));
    showContextMenu(viewTypeElementRef, items);
  }

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
        <p className={styles.annotation}>
          renderer:{' '}
          <span onClick={showRendererTypeMenu} ref={rendererElementRef}>
            {rendererType || '-'}
          </span>
        </p>
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
  onRendererTypeSwitch(rendererType: RendererType): void;
  onViewTypeSwitch(viewType: ViewType): void;
}
