import React, { FC, MouseEvent, useCallback, useEffect, useState } from 'react';
import { MouseButton } from '~/platform/constants';
import { Size } from '~/platform/interfaces';
import { findClosestElement, noop } from '~/platform/utils';
import {
  ANIMATION_DURATION,
  BUTTONS_MAX_WIDTH,
  TASKBAR_WIDTH
} from '../constants';
import {
  useAnimation,
  useEventListener,
  usePosition,
  useSize,
  useStore
} from './hooks';
import { Window } from './Window';

export const WindowContainer: FC<Props> = ({
  keepContentRatio = false,
  maxHeight = Infinity,
  maxWidth = Infinity,
  minHeight,
  minWidth,
  onResize = noop,
  resizable = true,
  visible,
  ...rest
}) => {
  const [frozen, setFrozen] = useState(false);
  const [maximized, setMaximized] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const [animationDurationMs, animate] = useAnimation();
  const listenEvent = useEventListener();
  const lastDisplayProperties = useStore<DisplayProperties>();

  const [size, setSize, setMaxSize] = useSize(
    { maxHeight, maxWidth, minHeight, minWidth },
    keepContentRatio,
    onResize
  );

  const [position, setPosition] = usePosition(size);

  const toggleMaximize = useCallback(
    (
      keepPosition: boolean = false,
      animationDuration: number = ANIMATION_DURATION
    ) => {
      if (!resizable) {
        return size;
      }

      animate(animationDuration);

      if (maximized && lastDisplayProperties.maximize !== undefined) {
        const { height, width, x, y } = lastDisplayProperties.maximize;

        if (!keepPosition) {
          setPosition(x, y, width);
        }
        setMaximized(false);
        delete lastDisplayProperties.maximize;
        return setSize(width, height);
      } else {
        lastDisplayProperties.maximize = { ...position, ...size };

        if (!keepPosition) {
          setPosition(TASKBAR_WIDTH, 0, size.width);
        }
        setMaximized(true);
        return setMaxSize();
      }
    },
    [
      animate,
      lastDisplayProperties,
      maximized,
      position,
      resizable,
      setMaxSize,
      setPosition,
      setSize,
      size
    ]
  );

  const onMoveStart = useCallback(
    (downEvent: MouseEvent) => {
      if (downEvent.button !== MouseButton.Left) {
        return;
      }

      downEvent.preventDefault();
      downEvent.persist();

      const target = downEvent.target as HTMLElement;

      if (findClosestElement(target, '.button') !== undefined) {
        return;
      }

      const dy = position.y - downEvent.clientY;
      let dx = position.x - downEvent.clientX;

      setFrozen(true);

      let shouldToggleMaximize = false;

      if (maximized && lastDisplayProperties.maximize !== undefined) {
        const offsetX = downEvent.nativeEvent.offsetX;
        const widthRatio = lastDisplayProperties.maximize.width / size.width;

        // Keeps the same position on the title bar in proportion to its width
        dx +=
          offsetX * widthRatio > BUTTONS_MAX_WIDTH
            ? offsetX * (1 - widthRatio)
            : offsetX - BUTTONS_MAX_WIDTH;

        shouldToggleMaximize = true;
      }

      let width = size.width;

      const removeMoveListener = listenEvent('mousemove', moveEvent => {
        if (shouldToggleMaximize) {
          width = toggleMaximize(true, 50).width;
          shouldToggleMaximize = false;
        }
        setPosition(moveEvent.clientX + dx, moveEvent.clientY + dy, width);
      });

      const removeUpListener = listenEvent('mouseup', () => {
        setFrozen(false);
        removeMoveListener();
        removeUpListener();
      });
    },
    [
      lastDisplayProperties,
      listenEvent,
      maximized,
      position,
      setPosition,
      size,
      toggleMaximize
    ]
  );

  const onResizeStart = useCallback(
    (downEvent: MouseEvent) => {
      if (downEvent.button !== MouseButton.Left) {
        return;
      }

      downEvent.preventDefault();
      downEvent.persist();

      if (maximized) {
        return;
      }

      setFrozen(true);

      const removeMoveListener = listenEvent('mousemove', moveEvent => {
        const width = size.width + moveEvent.clientX - downEvent.clientX;
        const height = size.height + moveEvent.clientY - downEvent.clientY;
        setSize(width, height);
      });

      const removeUpListener = listenEvent('mouseup', () => {
        setFrozen(false);
        removeMoveListener();
        removeUpListener();
      });
    },
    [listenEvent, maximized, setSize, size]
  );

  useEffect(() => {
    if (visible) {
      if (lastDisplayProperties.minimize !== undefined) {
        const { height, width, x, y } = lastDisplayProperties.minimize;
        animate(ANIMATION_DURATION);
        setMinimized(false);
        setSize(width, height);
        setPosition(x, y, width, true);
      }
    } else {
      animate(ANIMATION_DURATION);
      lastDisplayProperties.minimize = { ...position, ...size };
      setMinimized(true);
      setSize(0, 0, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  return (
    <Window
      {...rest}
      animationDurationMs={animationDurationMs}
      centered={position === undefined}
      frozen={frozen}
      maximized={maximized}
      minimized={minimized}
      onMaximize={toggleMaximize}
      onMoveStart={onMoveStart}
      onResizeStart={onResizeStart}
      position={position}
      resizable={true}
      size={size}
    />
  );
};

interface DisplayProperties {
  maximize?: { height: number; width: number; x: number; y: number };
  minimize?: { height: number; width: number; x: number; y: number };
}

interface Props {
  active: boolean;
  background: string;
  keepContentRatio?: boolean;
  maxHeight?: number;
  maxWidth?: number;
  minHeight: number;
  minWidth: number;
  resizable?: boolean;
  titleBackground: string;
  titleColor: string;
  visible: boolean;
  windowTitle: string;
  zIndex: number;
  onClose(): void;
  onMinimise(): void;
  onResize?(size: Size): void;
  onSelect(): void;
}
