import React, { FC, MouseEvent, useEffect, useRef, useState } from 'react';
import { useEventListener, useInjector } from '~/platform/hooks';
import { Size } from '~/platform/interfaces';
import { WindowManager } from '~/platform/services/WindowManager';
import { getRefElementSize } from '~/platform/utils';
import { Selection } from './Selection';
import styles from './VisibleArea.module.scss';
import { Windows } from './Windows';

export const VisibleArea: FC = () => {
  const [selectionVisible, setSelectionVisible] = useState(false);
  const [visibleAreaSize, setVisibleAreaSize] = useState<Size>();
  const visibleAreaRef = useRef<HTMLDivElement>(null);
  const windowManager = useInjector(WindowManager);

  useEffect(() => setVisibleAreaSize(getRefElementSize(visibleAreaRef)), []);

  useEventListener(
    'mouseup',
    () => setSelectionVisible(false),
    selectionVisible
  );

  useEventListener('resize', () =>
    requestAnimationFrame(() =>
      setVisibleAreaSize(getRefElementSize(visibleAreaRef))
    )
  );

  const mouseDownHandler = (downEvent: MouseEvent) => {
    if (downEvent.target !== visibleAreaRef.current) {
      return;
    }
    windowManager.unselectAllWindows();
    setSelectionVisible(true);
  };

  return (
    <div
      className={styles.visibleArea}
      onMouseDown={mouseDownHandler}
      ref={visibleAreaRef}
    >
      {visibleAreaSize && <Windows visibleAreaSize={visibleAreaSize} />}
      <Selection visible={selectionVisible} />
    </div>
  );
};
