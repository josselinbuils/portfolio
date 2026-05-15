import { faPalette } from '@fortawesome/free-solid-svg-icons/faPalette';
import cn from 'classnames';
import { type FunctionComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';

import { type LUTComponent } from '../../interfaces/LUTComponent';
import { type Viewport } from '../../models/Viewport';
import styles from './ColorPalette.module.css';
import { BarPreview } from './components/BarPreview/BarPreview';
import { GraphPreview } from './components/GraphPreview/GraphPreview';
import { LUTComponentList } from './components/LUTComponentList/LUTComponentList';

const baseLUTComponents = [
  { color: [0, 0, 255], end: 65, id: '0', start: 0 },
  { color: [0, 255, 0], end: 150, id: '1', start: 45 },
  { color: [255, 0, 0], end: 135, id: '2', start: 10 },
] as LUTComponent[];

export type ColorPaletteProps = {
  onLUTComponentsUpdate(lutComponents: LUTComponent[] | undefined): void;
  viewport: undefined | Viewport;
};

export const ColorPalette: FunctionComponent<ColorPaletteProps> = ({
  onLUTComponentsUpdate,
  viewport,
}) => {
  const [initialViewportLutComponents, setInitialViewportLutComponents] =
    useState<LUTComponent[] | undefined>();
  const [activeLUTComponentID, setActiveLUTComponentID] = useState<string>();
  const [lutComponents, setLUTComponents] = useState<LUTComponent[]>([]);
  const [open, setOpen] = useState(false);

  function toggleOpen() {
    setOpen(!open);

    if (open) {
      onLUTComponentsUpdate(initialViewportLutComponents);
    }
  }

  useEffect(() => {
    setInitialViewportLutComponents(viewport?.lutComponents);
    setLUTComponents(
      structuredClone(viewport?.lutComponents ?? baseLUTComponents),
    );
  }, [viewport]);

  useEffect(() => {
    if (open) {
      onLUTComponentsUpdate(lutComponents);
    }
  }, [lutComponents, onLUTComponentsUpdate, open]);

  function addLUTComponent(): void {
    setLUTComponents([
      ...lutComponents,
      {
        color: [255, 255, 255],
        end: 85,
        id: Date.now().toString(),
        start: 0,
      },
    ]);
  }

  function deleteLUTComponent(componentId: string): void {
    setLUTComponents(
      lutComponents.filter((component) => component.id !== componentId),
    );
  }

  function dragLUTComponent(
    downEvent: MouseEvent,
    previewWidth: number,
    componentId: string,
  ): void {
    const targetLUTComponent = lutComponents.find(
      ({ id }) => id === componentId,
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
        ((moveEvent.clientX - downEvent.clientX) / previewWidth) * 256,
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
      ({ id }) => id === componentId,
    );

    if (targetLUTComponent === undefined) {
      throw new Error('Unable to find target LUT component');
    }

    (targetLUTComponent as LUTComponent).color = color;
    setLUTComponents(lutComponents.slice());
  }

  return (
    <div className={cn(styles.colorPalette, { [styles.open]: open })}>
      <button className={styles.button} onClick={toggleOpen} type="button">
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
            lutComponents={lutComponents}
            onLUTComponentAdd={addLUTComponent}
            onLUTComponentColorChange={setLUTComponentColor}
            onLUTComponentDelete={deleteLUTComponent}
          />
        </>
      )}
    </div>
  );
};
