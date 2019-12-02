import React, { FC, ReactElement, useLayoutEffect, useState } from 'react';
import { useDragAndDrop } from '~/platform/hooks';
import { Size } from '~/platform/interfaces';
import { TOOLBAR_HEIGHT } from '../constants';
import { bound } from '../utils';

export const Resizable: FC<Props> = ({
  children,
  keepContentRatio = false,
  maxHeight = Infinity,
  maxWidth = Infinity,
  minHeight,
  minWidth,
  visibleAreaSize
}) => {
  const [resizing, setResizing] = useState(false);
  const [unmaximizeSize, setUnmaximizeSize] = useState<Size>();
  const [unminimizeSize, setUnminimizeSize] = useState<Size>();
  const [size, setSize] = useState({ height: minHeight, width: minWidth });

  useLayoutEffect(() => {
    setSize({ height: minHeight, width: minWidth });
  }, [minHeight, minWidth]);

  function applyContentRatio(sizeToUpdate: Size): Size {
    const { width } = sizeToUpdate;
    const contentRatio = minWidth / (minHeight - TOOLBAR_HEIGHT);
    const height = Math.round(width / contentRatio) + TOOLBAR_HEIGHT;
    return { height, width };
  }

  function boundSize(sizeToBound: Size): Size {
    return {
      width: bound(sizeToBound.width, minWidth, maxWidth),
      height: bound(sizeToBound.height, minHeight, maxHeight)
    };
  }

  function getUnmaximizeSize(): Size | undefined {
    return unmaximizeSize;
  }

  function resetSize(): void {
    if (unminimizeSize !== undefined) {
      setSize(unminimizeSize);
      setUnminimizeSize(undefined);
    } else if (unmaximizeSize !== undefined) {
      setSize(unmaximizeSize);
      setUnmaximizeSize(undefined);
    }
  }

  const resizeStartHandler = useDragAndDrop(
    (downEvent: React.MouseEvent) => (moveEvent: MouseEvent) => {
      const width = size.width + moveEvent.clientX - downEvent.clientX;
      const height = size.height + moveEvent.clientY - downEvent.clientY;
      let newSize = boundSize({ height, width });

      if (keepContentRatio) {
        newSize = applyContentRatio(newSize);
      }
      setSize(newSize);

      if (!resizing) {
        setResizing(true);
      }
    },
    () => setResizing(false)
  );

  function setMaximizedSize(): void {
    setSize(visibleAreaSize);
    setUnmaximizeSize(size);
  }

  function setMinimizedSize(): void {
    setUnminimizeSize(size);
    setSize({ height: 0, width: 0 });
  }

  return children({
    getUnmaximizeSize,
    maximized: unmaximizeSize !== undefined,
    minimized: unminimizeSize !== undefined,
    onResizeStart: resizeStartHandler,
    resetSize,
    resizing,
    size,
    setMaximizedSize,
    setMinimizedSize
  });
};

interface Props {
  keepContentRatio?: boolean;
  maxHeight?: number;
  maxWidth?: number;
  minHeight: number;
  minimizedTopPosition?: number;
  minWidth: number;
  visibleAreaSize: Size;
  children(resizableProps: ResizableProps): ReactElement;
}

export interface ResizableProps {
  maximized: boolean;
  minimized: boolean;
  resizing: boolean;
  size: Size;
  getUnmaximizeSize(): Size | undefined;
  onResizeStart(downEvent: React.MouseEvent): void;
  resetSize(): void;
  setMaximizedSize(): void;
  setMinimizedSize(): void;
}
