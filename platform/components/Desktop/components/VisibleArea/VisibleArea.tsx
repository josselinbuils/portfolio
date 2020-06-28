import React, { FC, MouseEvent, useEffect, useRef, useState } from 'react';
import { useEventListener } from '~/platform/hooks/useEventListener';
import { Size } from '~/platform/interfaces/Size';
import { useInjector } from '~/platform/providers/InjectorProvider/useInjector';
import { WindowManager } from '~/platform/services/WindowManager';
import { getRefElementSize } from '~/platform/utils/getRefElementSize';
import { Selection } from './Selection';
import { Windows } from './Windows';

import styles from './VisibleArea.module.scss';

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
      <Windows visibleAreaSize={visibleAreaSize} />
      <Selection visible={selectionVisible} />
    </div>
  );
};
