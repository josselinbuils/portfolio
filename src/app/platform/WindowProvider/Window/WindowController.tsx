import React, { FC, useEffect, useRef, useState } from 'react';
import { useObject } from '~/platform/utils';

import { ANIMATION_DURATION, LEFT_OFFSET } from '../constants';

import {
  applyContentRatio,
  bound,
  boundWindowPosition,
  getRefElement,
  getRefElementSize,
  startAnimation
} from './utils';
import { Window } from './Window';

export const WindowContainer: FC<Props> = ({
  defaultHeight,
  defaultWidth,
  keepContentRatio = false,
  maxHeight = Infinity,
  maxWidth = Infinity,
  minHeight = 100,
  minWidth = 100,
  onResize = () => {},
  resizable = true,
  visible,
  ...rest
}) => {
  const [animate, setAnimate] = useState(false);
  const contentRatio = useRef(0);
  const [maximized, setMaximized] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [size, setSize] = useState({
    height: defaultHeight,
    width: defaultWidth
  });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const lastDisplayProperties = useObject<DisplayProperties>({});
  const contentRef = useRef<HTMLDivElement>(null);
  const windowRef = useRef<HTMLDivElement>(null);

  const setMaxSize = () => {
    updateSize(window.innerWidth - LEFT_OFFSET, window.innerHeight, true);
  };

  const updatePosition = (x: number, y: number, force: boolean = false) => {
    setPosition(force ? { x, y } : boundWindowPosition(windowRef, x, y));
  };

  const updateSize = (
    width: number,
    height: number,
    force: boolean = false
  ) => {
    if (!force) {
      const ratio = contentRatio.current;

      width = bound(width, minWidth, maxWidth);
      height = bound(height, minHeight, maxHeight);

      if (ratio > 0) {
        height = applyContentRatio(windowRef, contentRef, ratio, width);
      }
    }

    setSize({ width, height });
    onResize({ width, height });
  };

  const toggleMaximize = async (
    keepPosition: boolean = false,
    animationDelay: number = ANIMATION_DURATION
  ) => {
    if (!resizable) {
      return;
    }

    const [endPromise] = await startAnimation(setAnimate, animationDelay);

    if (maximized && lastDisplayProperties.maximize !== undefined) {
      const { left, top, width, height } = lastDisplayProperties.maximize;

      if (!keepPosition) {
        updatePosition(left, top);
      }
      updateSize(width, height);
    } else {
      const windowElement = getRefElement(windowRef);
      lastDisplayProperties.maximize = windowElement.getBoundingClientRect();

      if (!keepPosition) {
        updatePosition(LEFT_OFFSET, 0);
      }
      setMaxSize();
    }

    await endPromise;
    setMaximized(!maximized);
  };

  useEffect(() => {
    (async () => {
      await startAnimation(setAnimate);

      if (visible) {
        if (lastDisplayProperties.minimize !== undefined) {
          const { left, top, width, height } = lastDisplayProperties.minimize;
          setMinimized(false);
          updateSize(width, height);
          updatePosition(left, top, true);
        }
      } else {
        const windowElement = getRefElement(windowRef);
        lastDisplayProperties.minimize = windowElement.getBoundingClientRect();
        setMinimized(true);
        updateSize(0, 0, true);
      }
    })();
  }, [visible]);

  useEffect(() => {
    const windowSize = getRefElementSize(windowRef);
    const { width = windowSize.width, height = windowSize.height } = size;

    updateSize(width, height);

    const x = Math.round((window.innerWidth - width) * 0.5);
    const y = Math.round((window.innerHeight - height) * 0.2);

    updatePosition(x, y);

    if (keepContentRatio) {
      const contentSize = getRefElementSize(contentRef);
      contentRatio.current = contentSize.width / contentSize.height;
    }
  }, []);

  return (
    <Window
      {...rest}
      animate={animate}
      contentRef={contentRef}
      maximized={maximized}
      minimized={minimized}
      onMaximize={toggleMaximize}
      onResizeStart={() => {}}
      position={position}
      ref={windowRef}
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
  defaultHeight?: number;
  defaultWidth?: number;
  keepContentRatio?: boolean;
  maxHeight?: number;
  maxWidth?: number;
  minHeight?: number;
  minWidth?: number;
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
  onTitleDoubleClick(): void;
  onTitleMouseDown(): void;
}
