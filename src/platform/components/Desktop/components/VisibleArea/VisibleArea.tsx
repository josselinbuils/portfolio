import { Suspense, type FC, useEffect, useRef, useState } from 'preact/compat';
import { useEventListener } from '@/platform/hooks/useEventListener';
import { type Position } from '@/platform/interfaces/Position';
import { type Size } from '@/platform/interfaces/Size';
import { windowManager } from '@/platform/services/windowManager/windowManager';
import { getRefElementSize } from '@/platform/utils/getRefElementSize';
import { lazy } from '@/platform/utils/lazy';
import { CursorDelayedLoader } from '../../../CursorDelayedLoader/CursorDelayedLoader';
import styles from './VisibleArea.module.scss';
import { Windows } from './Windows';

const Selection = lazy(async () => (await import('./Selection')).Selection);

export const VisibleArea: FC = () => {
  const [selectionStartPosition, setSelectionStartPosition] =
    useState<Position<number>>();
  const [visibleAreaSize, setVisibleAreaSize] = useState<Size>();
  const visibleAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => setVisibleAreaSize(getRefElementSize(visibleAreaRef)), []);

  useEventListener(
    'mouseup',
    () => setSelectionStartPosition(undefined),
    !!selectionStartPosition,
  );

  useEventListener('resize', () =>
    requestAnimationFrame(() =>
      setVisibleAreaSize(getRefElementSize(visibleAreaRef)),
    ),
  );

  const mouseDownHandler = (downEvent: MouseEvent) => {
    if (downEvent.target !== visibleAreaRef.current) {
      return;
    }
    windowManager.unselectAllWindows();
    setSelectionStartPosition({
      x: downEvent.clientX,
      y: downEvent.clientY,
    });
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className={styles.visibleArea}
      onMouseDown={mouseDownHandler}
      ref={visibleAreaRef}
    >
      <Windows visibleAreaSize={visibleAreaSize} />
      {!!selectionStartPosition && (
        <Suspense fallback={<CursorDelayedLoader />}>
          <Selection startPosition={selectionStartPosition} />
        </Suspense>
      )}
    </div>
  );
};
