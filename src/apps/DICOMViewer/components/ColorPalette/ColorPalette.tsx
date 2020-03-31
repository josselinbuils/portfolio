import { faPalette } from '@fortawesome/free-solid-svg-icons/faPalette';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import cn from 'classnames';
import React, { FC, useEffect, useState } from 'react';
import { LUTComponent } from '~/apps/DICOMViewer/interfaces';
import { BarPreview, GraphPreview, LUTComponentList } from './components';

import styles from './ColorPalette.module.scss';

const baseLUTComponents = [
  { id: '0', start: 0, end: 65, color: [0, 0, 255] },
  { id: '1', start: 45, end: 150, color: [0, 255, 0] },
  { id: '2', start: 10, end: 135, color: [255, 0, 0] },
] as LUTComponent[];

export const ColorPalette: FC<Props> = ({ onLUTComponentsUpdate }) => {
  const [activeLUTComponentID, setActiveLUTComponentID] = useState<string>();
  const [lutComponents, setLUTComponents] = useState<LUTComponent[]>(() =>
    baseLUTComponents.map((component) => ({ ...component }))
  );
  const [open, setOpen] = useState(false);

  useEffect(() => {
    onLUTComponentsUpdate(open ? lutComponents : undefined);
  }, [lutComponents, onLUTComponentsUpdate, open]);

  function addLUTComponent(): void {
    setLUTComponents([
      ...lutComponents,
      {
        id: Date.now().toString(),
        color: [255, 255, 255],
        start: 0,
        end: 85,
      },
    ]);
  }

  function deleteLUTComponent(componentId: string): void {
    setLUTComponents(
      lutComponents.filter((component) => component.id !== componentId)
    );
  }

  function dragLUTComponent(
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

      if (newEnd < 5) {
        newEnd = 5;
        newStart = newEnd - lutComponentWidth;
      } else if (newStart > 250) {
        newStart = 250;
        newEnd = newStart + lutComponentWidth;
      }

      (targetLUTComponent as LUTComponent).start = newStart;
      (targetLUTComponent as LUTComponent).end = newEnd;
      setLUTComponents(lutComponents.slice());
    }

    function mouseUpListener(): void {
      window.removeEventListener('mousemove', mouseMoveListener);
      window.removeEventListener('mouseup', mouseUpListener);
      setActiveLUTComponentID(undefined);
    }

    window.addEventListener('mousemove', mouseMoveListener);
    window.addEventListener('mouseup', mouseUpListener);
  }

  function setLUTComponentColor(componentId: string, color: number[]): void {
    const targetLUTComponent = lutComponents.find(
      ({ id }) => id === componentId
    );

    if (targetLUTComponent === undefined) {
      throw new Error('Unable to find target LUT component');
    }

    (targetLUTComponent as LUTComponent).color = color;
    setLUTComponents(lutComponents.slice());
  }

  return (
    <div className={cn(styles.colorPalette, { [styles.open]: open })}>
      <button className={styles.button} onClick={() => setOpen(!open)}>
        <FontAwesomeIcon icon={faPalette} />
      </button>
      {open && (
        <>
          <GraphPreview
            activeLUTComponentID={activeLUTComponentID}
            className={styles.graphPreview}
            lutComponents={lutComponents}
            onLUTComponentDrag={dragLUTComponent}
          />
          <BarPreview
            className={styles.barPreview}
            lutComponents={lutComponents}
          />
          <LUTComponentList
            onLUTComponentAdd={addLUTComponent}
            lutComponents={lutComponents}
            onLUTComponentColorChange={setLUTComponentColor}
            onLUTComponentDelete={deleteLUTComponent}
          />
        </>
      )}
    </div>
  );
};

interface Props {
  onLUTComponentsUpdate(lutComponents: LUTComponent[] | undefined): void;
}
