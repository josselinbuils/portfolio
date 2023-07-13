import { useEventListener } from '@josselinbuils/hooks/useEventListener';
import { type FC, type MouseEvent, Suspense } from 'react';
import { useEffect, useRef, useState } from 'react';
import { type Size } from '@/platform/interfaces/Size';
import { useInjector } from '@/platform/providers/InjectorProvider/useInjector';
import { WindowManager } from '@/platform/services/WindowManager/WindowManager';
import { getRefElementSize } from '@/platform/utils/getRefElementSize';
import { lazy } from '@/platform/utils/lazy';
import styles from './VisibleArea.module.scss';
import { Windows } from './Windows';

const Selection = lazy(async () => (await import('./Selection')).Selection);

export const VisibleArea: FC = () => {
  const [selectionVisible, setSelectionVisible] = useState(false);
  const [visibleAreaSize, setVisibleAreaSize] = useState<Size>();
  const visibleAreaRef = useRef<HTMLDivElement>(null);
  const windowManager = useInjector(WindowManager);

  useEffect(() => setVisibleAreaSize(getRefElementSize(visibleAreaRef)), []);

  useEventListener(
    'mouseup',
    () => setSelectionVisible(false),
    selectionVisible,
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
    setSelectionVisible(true);
  };

  return (
    // eslint-disable-next-line jsx-a11y/no-static-element-interactions
    <div
      className={styles.visibleArea}
      onMouseDown={mouseDownHandler}
      ref={visibleAreaRef}
    >
      <Windows visibleAreaSize={visibleAreaSize} />
      {selectionVisible && (
        <Suspense>
          <Selection />
        </Suspense>
      )}
    </div>
  );
};
