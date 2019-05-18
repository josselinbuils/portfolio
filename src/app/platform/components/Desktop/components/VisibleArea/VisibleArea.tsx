import React, { FC, useEffect, useRef, useState } from 'react';
import {
  useDragAndDrop,
  useEventListener,
  useInjector
} from '~/platform/hooks';
import { WindowManager } from '~/platform/services/WindowManager';
import { Windows } from './Windows';
import styles from './VisibleArea.module.scss';
import { Size } from '~/platform/interfaces';
import { getRefElementSize } from '~/platform/utils';

export const VisibleArea: FC = () => {
  const [visibleAreaSize, setVisibleAreaSize] = useState<Size>();
  const selectionRef = useRef<HTMLDivElement>(null);
  const visibleAreaRef = useRef<HTMLDivElement>(null);
  const windowManager = useInjector(WindowManager);

  useEffect(() => {
    setVisibleAreaSize(getRefElementSize(visibleAreaRef));
  }, []);

  useEventListener('resize', () => {
    setVisibleAreaSize(getRefElementSize(visibleAreaRef));
  });

  const mouseDownHandler = useDragAndDrop(
    (downEvent: MouseEvent) => {
      if (downEvent.target !== visibleAreaRef.current) {
        return;
      }

      const visibleAreaElement = visibleAreaRef.current as HTMLDivElement;
      const offsetX = -visibleAreaElement.getBoundingClientRect().left;
      const startX = downEvent.clientX + offsetX;
      const startY = downEvent.clientY;
      const selectionStyle = (selectionRef.current as HTMLDivElement).style;

      windowManager.unselectAllWindows();
      selectionStyle.display = 'block';

      return (moveEvent: MouseEvent) => {
        const x = moveEvent.clientX + offsetX;
        const y = moveEvent.clientY;

        selectionStyle.left = `${Math.min(startX, x)}px`;
        selectionStyle.top = `${Math.min(startY, y)}px`;
        selectionStyle.width = `${Math.abs(x - startX)}px`;
        selectionStyle.height = `${Math.abs(y - startY)}px`;
      };
    },
    () => {
      const selectionStyle = (selectionRef.current as HTMLDivElement).style;
      selectionStyle.display = 'none';
      selectionStyle.width = '0';
      selectionStyle.height = '0';
    }
  );

  return (
    <div
      className={styles.visibleArea}
      onMouseDown={mouseDownHandler}
      ref={visibleAreaRef}
    >
      {visibleAreaSize && <Windows visibleAreaSize={visibleAreaSize} />}
      <div className={styles.selection} ref={selectionRef} />
    </div>
  );
};
