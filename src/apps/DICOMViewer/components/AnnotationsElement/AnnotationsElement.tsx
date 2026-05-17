import { type IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { faCheck } from '@fortawesome/free-solid-svg-icons/faCheck';
import { faSquareCaretDown } from '@fortawesome/free-solid-svg-icons/faSquareCaretDown';
import cn from 'classnames';
import { type FunctionComponent, type RefObject } from 'preact';
import { useRef } from 'preact/hooks';

import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';
import {
  type MenuItemDescriptor,
  useMenu,
} from '@/platform/components/Menu/useMenu';

import { type Annotations } from '../../interfaces/Annotations';
import { type RendererType } from '../../interfaces/RendererType';
import { type ViewType } from '../../interfaces/ViewType';
import classes from './AnnotationsElement.module.css';

const viewTypeLabels: Record<ViewType, string> = {
  axial: 'Axial',
  bones: '3D Bones',
  coronal: 'Coronal',
  native: 'Native',
  oblique: 'Oblique',
  sagittal: 'Sagittal',
  skin: '3D Skin',
  tissues: '3D Tissues',
};

export type AnnotationsElementProps = {
  annotations: Annotations;
  availableViewTypes: ViewType[];
  onRendererTypeSwitch(rendererType: RendererType): void;
  onViewTypeSwitch(viewType: ViewType): void;
};

export const AnnotationsElement: FunctionComponent<AnnotationsElementProps> = ({
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
    position: 'left' | 'right',
  ): void {
    if (elementRef.current === null) {
      return;
    }
    const { bottom, left, right } = elementRef.current.getBoundingClientRect();

    showMenu({
      className: classes.contextMenu,
      items,
      position: {
        x: position === 'left' ? left : right - 140,
        y: bottom + 5,
      },
    });
  }

  function showRendererTypeMenu(): void {
    const items = (['JavaScript', 'WebGPU'] satisfies RendererType[]).map(
      (type) => {
        const icon = getMenuItemIcon(type === rendererType);

        return {
          onClick: () => onRendererTypeSwitch(type),
          title: (
            <>
              <div className={classes.contextMenuIcon}>
                {icon && <FontAwesomeIcon icon={icon} />}
              </div>
              {type}
            </>
          ),
        };
      },
    );
    showContextMenu(rendererElementRef, items, 'right');
  }

  function showViewTypeMenu(): void {
    const items = availableViewTypes.map((type) => {
      const icon = getMenuItemIcon(type === annotations.viewType);

      return {
        onClick: () => onViewTypeSwitch(type),
        title: (
          <>
            <div className={classes.contextMenuIcon}>
              {icon && <FontAwesomeIcon icon={icon} />}
            </div>
            {viewTypeLabels[type]}
          </>
        ),
      };
    });
    showContextMenu(viewTypeElementRef, items, 'left');
  }

  return (
    <>
      <div className={classes.overlayTopLeft}>
        <p className={classes.annotation}>{datasetName || '-'}</p>
        <button
          className={classes.annotation}
          onClick={showViewTypeMenu}
          ref={viewTypeElementRef}
          type="button"
        >
          {viewType ? viewTypeLabels[viewType] : 'None'}{' '}
          <FontAwesomeIcon icon={faSquareCaretDown} />
        </button>
      </div>
      <div className={classes.overlayTopRight}>
        <p className={classes.annotation}>
          renderer:{' '}
          <button
            className={classes.annotation}
            onClick={showRendererTypeMenu}
            ref={rendererElementRef}
            type="button"
          >
            {rendererType || '-'} <FontAwesomeIcon icon={faSquareCaretDown} />
          </button>
        </p>
        <p className={cn(classes.annotation, classes.mono)}>
          framerate: {fps ? `${fps}fps` : '-'}
        </p>
        <p className={cn(classes.annotation, classes.mono)}>
          rendering:{' '}
          {meanRenderDuration ? `${meanRenderDuration.toFixed(2)}ms` : '-'}
        </p>
      </div>
      <div className={classes.overlayBottomRight}>
        <p className={cn(classes.annotation, classes.mono)}>
          zoom: {zoom ? zoom.toFixed(2) : '-'}
        </p>
      </div>
      <div className={classes.overlayBottomLeft}>
        <p className={cn(classes.annotation, classes.mono)}>
          wc: {windowCenter || '-'}
        </p>
        <p className={cn(classes.annotation, classes.mono)}>
          ww: {windowWidth || '-'}
        </p>
      </div>
      {menuElement}
    </>
  );
};
