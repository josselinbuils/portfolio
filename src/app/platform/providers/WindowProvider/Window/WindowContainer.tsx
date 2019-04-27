import React, { FC, useCallback, useEffect, useRef, useState } from 'react';
import { Size } from '~/platform/interfaces';
import { noop } from '~/platform/utils';

import { ANIMATION_DURATION, LEFT_OFFSET } from '../constants';

import {
  useAnimation,
  useMount,
  usePosition,
  useSize,
  useStore
} from './hooks';
import { getRefElement, getRefElementSize } from './utils';
import { Window } from './Window';

export const WindowContainer: FC<Props> = ({
  defaultSize,
  keepContentRatio = false,
  maxSize = { height: Infinity, width: Infinity },
  minSize = { height: 100, width: 100 },
  onResize = noop,
  resizable = true,
  visible,
  ...rest
}) => {
  const [maximized, setMaximized] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  const [animationDurationMs, animate] = useAnimation();
  const [position, setPosition] = usePosition(windowRef);
  const lastDisplayProperties = useStore<DisplayProperties>();
  const [size, setSize, setMaxSize] = useSize(
    defaultSize,
    maxSize,
    minSize,
    keepContentRatio,
    windowRef,
    contentRef,
    onResize
  );

  const toggleMaximize = useCallback(
    async (
      keepPosition: boolean = false,
      animationDuration: number = ANIMATION_DURATION
    ) => {
      if (!resizable) {
        return;
      }

      animate(animationDuration);

      if (maximized && lastDisplayProperties.maximize !== undefined) {
        const { left, top, width, height } = lastDisplayProperties.maximize;

        if (!keepPosition) {
          setPosition(left, top);
        }
        setSize(width, height);
      } else {
        const windowElement = getRefElement(windowRef);
        lastDisplayProperties.maximize = windowElement.getBoundingClientRect();

        if (!keepPosition) {
          setPosition(LEFT_OFFSET, 0);
        }
        setMaxSize();
      }
      setMaximized(!maximized);
    },
    [
      animate,
      lastDisplayProperties,
      maximized,
      resizable,
      setMaxSize,
      setPosition,
      setSize
    ]
  );

  useEffect(() => {
    animate(ANIMATION_DURATION);

    if (visible) {
      if (lastDisplayProperties.minimize !== undefined) {
        const { left, top, width, height } = lastDisplayProperties.minimize;
        setMinimized(false);
        setSize(width, height);
        setPosition(left, top, true);
      }
    } else {
      const windowElement = getRefElement(windowRef);
      lastDisplayProperties.minimize = windowElement.getBoundingClientRect();
      setMinimized(true);
      setSize(0, 0, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useMount(() => {
    const windowSize = getRefElementSize(windowRef);
    const width = size !== undefined ? size.width : windowSize.width;
    const height = size !== undefined ? size.height : windowSize.height;

    setSize(width, height);

    const x = Math.round((window.innerWidth - width) * 0.5);
    const y = Math.round((window.innerHeight - height) * 0.2);

    setPosition(x, y);
  });

  return (
    <Window
      {...rest}
      animationDurationMs={animationDurationMs}
      centered={position === undefined}
      contentRef={contentRef}
      maximized={maximized}
      minimized={minimized}
      onMaximize={toggleMaximize}
      onMoveStart={() => {}}
      onResizeStart={() => {}}
      position={position}
      ref={windowRef}
      resizable={true}
      size={size}
    />
  );
};

interface DisplayProperties {
  maximize?: ClientRect;
  minimize?: ClientRect;
}

interface Props {
  active: boolean;
  background: string;
  defaultSize?: Size;
  keepContentRatio?: boolean;
  maxSize?: Size;
  minSize?: Size;
  resizable?: boolean;
  titleBackground: string;
  titleColor: string;
  visible: boolean;
  windowTitle: string;
  zIndex: number;
  onClose(): void;
  onMinimise(): void;
  onResize?(size: { width: number; height: number }): void;
  onSelect(): void;
}
