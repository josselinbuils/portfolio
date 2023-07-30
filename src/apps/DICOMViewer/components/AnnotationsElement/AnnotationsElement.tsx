import { type IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';
import { faSquareCaretDown } from '@fortawesome/free-solid-svg-icons/faSquareCaretDown';
import { type FC, type RefObject, useRef } from 'preact/compat';
import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';
import {
  type MenuItemDescriptor,
  useMenu,
} from '@/platform/components/Menu/useMenu';
import { RendererType, type ViewType } from '../../constants';
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
  const { menuElement, showMenu } = useMenu();
  const rendererElementRef = useRef<HTMLButtonElement>(null);
  const viewTypeElementRef = useRef<HTMLButtonElement>(null);

  function getMenuItemIcon(isItemActive: boolean): IconDefinition | undefined {
    return isItemActive ? faCheck : undefined;
  }

  function showContextMenu(
    elementRef: RefObject<HTMLElement>,
    items: MenuItemDescriptor[],
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
    const items = [RendererType.JavaScript, RendererType.WebGL].map((type) => {
      const icon = getMenuItemIcon(type === rendererType);

      return {
        title: (
          <>
            <div className={styles.contextMenuIcon}>
              {icon && <FontAwesomeIcon icon={icon} />}
            </div>
            {type}
          </>
        ),
        onClick: () => onRendererTypeSwitch(type),
      };
    });
    showContextMenu(rendererElementRef, items);
  }

  function showViewTypeMenu(): void {
    const items = availableViewTypes.map((type) => {
      const icon = getMenuItemIcon(type === annotations.viewType);

      return {
        title: (
          <>
            <div className={styles.contextMenuIcon}>
              {icon && <FontAwesomeIcon icon={icon} />}
            </div>
            {type}
          </>
        ),
        onClick: () => onViewTypeSwitch(type),
      };
    });
    showContextMenu(viewTypeElementRef, items);
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
      {menuElement}
    </>
  );
};

interface Props {
  annotations: Annotations;
  availableViewTypes: ViewType[];
  onRendererTypeSwitch(rendererType: RendererType): void;
  onViewTypeSwitch(viewType: ViewType): void;
}
