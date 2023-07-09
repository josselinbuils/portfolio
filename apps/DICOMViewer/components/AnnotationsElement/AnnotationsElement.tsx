import { type IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';
import { faSquareCaretDown } from '@fortawesome/free-solid-svg-icons/faSquareCaretDown';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { type FC, type RefObject } from 'react';
import { useRef } from 'react';
import { type ViewType } from '~/apps/DICOMViewer/constants';
import { RendererType } from '~/apps/DICOMViewer/constants';
import { type ContextMenuItemDescriptor } from '~/platform/providers/ContextMenuProvider/ContextMenuItemDescriptor';
import { useContextMenu } from '~/platform/providers/ContextMenuProvider/useContextMenu';
import { type Annotations } from '../../interfaces/Annotations';
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
  const { showContextMenu } = useContextMenu();
  const rendererElementRef = useRef<HTMLButtonElement>(null);
  const viewTypeElementRef = useRef<HTMLButtonElement>(null);

  function getMenuItemIcon(isItemActive: boolean): IconDefinition | undefined {
    return isItemActive ? faCheck : undefined;
  }

  function showMenu(
    elementRef: RefObject<HTMLElement>,
    items: ContextMenuItemDescriptor[],
  ): void {
    if (elementRef.current === null) {
      return;
    }
    const { bottom, left } = elementRef.current.getBoundingClientRect();

    showContextMenu({
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
    showMenu(rendererElementRef, items);
  }

  function showViewTypeMenu(): void {
    const items = availableViewTypes.map((type) => ({
      icon: getMenuItemIcon(type === annotations.viewType),
      title: type,
      onClick: () => onViewTypeSwitch(type),
    }));
    showMenu(viewTypeElementRef, items);
  }

  return (
    <>
      <div className={styles.overlayTopLeft}>
        <p className={styles.annotation}>{datasetName || '-'}</p>
        <button
          className={styles.annotation}
          onClick={showViewTypeMenu}
          ref={viewTypeElementRef}
          type="button"
        >
          {viewType} <FontAwesomeIcon icon={faSquareCaretDown} />
        </button>
      </div>
      <div className={styles.overlayTopRight}>
        <p className={styles.annotation}>
          renderer:{' '}
          <button
            className={styles.annotation}
            onClick={showRendererTypeMenu}
            ref={rendererElementRef}
            type="button"
          >
            {rendererType || '-'} <FontAwesomeIcon icon={faSquareCaretDown} />
          </button>
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
