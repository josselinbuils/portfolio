import cn from 'classnames';
import React, { FC, MouseEvent, useCallback, useEffect, useState } from 'react';
import { Position, Size } from '~/platform/interfaces';
import { noop } from '~/platform/utils';
import { ANIMATION_DURATION, TASKBAR_WIDTH } from './constants';
import { useAnimation, useEventListener, usePosition, useSize } from './hooks';
import { ResizeArea } from './ResizeArea';
import { TitleBar } from './TitleBar';
import { getRelativeOffset } from './utils';
import styles from './Window.module.scss';

const VERTICAL_OFFSET_TO_UNMAXIMIZE = 20;

export const Window: FC<Props> = ({
  active,
  background,
  children,
  keepContentRatio = false,
  id,
  maxHeight = Infinity,
  maxWidth = Infinity,
  minHeight,
  minWidth,
  onClose,
  onMinimise,
  onResize = noop,
  onSelect,
  resizable = true,
  title,
  titleBackground,
  titleColor,
  visible,
  zIndex
}) => {
  const [frozen, setFrozen] = useState(false);
  const [minimized, setMinimized] = useState(false);
  const [animationDurationMs, animate] = useAnimation();
  const listenEvent = useEventListener();
  const [size, setSize, setMaxSize] = useSize(
    { maxHeight, maxWidth, minHeight, minWidth },
    keepContentRatio,
    onResize
  );
  const [position, setPosition] = usePosition(size);
  const [unmaximizeProps, setUnmaximizeProps] = useState<Position & Size>();
  const [unminimizeProps, setUnminimizeProps] = useState<Position & Size>();
  const maximized = unmaximizeProps !== undefined;

  const toggleMaximize = useCallback(
    (
      keepPosition: boolean = false,
      animationDuration: number = ANIMATION_DURATION
    ) => {
      if (!resizable) {
        return size;
      }

      animate(animationDuration);

      if (unmaximizeProps !== undefined) {
        const { height, width, x, y } = unmaximizeProps;

        if (!keepPosition) {
          setPosition(x, y, width);
        }
        setUnmaximizeProps(undefined);
        return setSize(width, height);
      } else {
        setUnmaximizeProps({ ...position, ...size });

        if (!keepPosition) {
          setPosition(TASKBAR_WIDTH, 0, size.width);
        }
        return setMaxSize();
      }
    },
    [
      animate,
      position,
      resizable,
      setMaxSize,
      setPosition,
      setSize,
      size,
      unmaximizeProps
    ]
  );

  const onMoveStart = useCallback(
    (downEvent: MouseEvent) => {
      downEvent.persist();

      const dy = position.y - downEvent.clientY;
      let dx = position.x - downEvent.clientX;

      setFrozen(true);

      let shouldToggleMaximize = false;

      if (unmaximizeProps !== undefined) {
        const nextWidth = unmaximizeProps.width;
        dx += getRelativeOffset(downEvent.nativeEvent, size.width, nextWidth);
        shouldToggleMaximize = true;
      }

      let width = size.width;

      const removeMoveListener = listenEvent('mousemove', moveEvent => {
        if (
          shouldToggleMaximize &&
          moveEvent.clientY < downEvent.clientY + VERTICAL_OFFSET_TO_UNMAXIMIZE
        ) {
          return;
        }
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
    [listenEvent, position, setPosition, size, toggleMaximize, unmaximizeProps]
  );

  const onResizeStart = useCallback(
    (downEvent: MouseEvent) => {
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
      if (unminimizeProps !== undefined) {
        const { height, width, x, y } = unminimizeProps;
        animate(ANIMATION_DURATION);
        setMinimized(false);
        setSize(width, height);
        setPosition(x, y, width, true);
      }
    } else {
      animate(ANIMATION_DURATION);
      setUnminimizeProps({ ...position, ...size });
      setMinimized(true);
      setSize(0, 0, true);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  useEffect(() => {
    return listenEvent('resize', () => {
      if (maximized) {
        setMaxSize();
      }
    });
  }, [listenEvent, maximized, setMaxSize]);

  const closeHandler = useCallback(() => onClose(id), [id, onClose]);
  const minimizeHandler = useCallback(() => onMinimise(id), [id, onMinimise]);
  const selectHandler = useCallback(() => onSelect(id), [id, onSelect]);

  const animated = animationDurationMs !== undefined;
  const className = cn(styles.window, {
    [styles.active]: active,
    [styles.animated]: animated,
    [styles.maximized]: maximized,
    [styles.minimized]: minimized
  });
  const { x, y } = position;
  const { height, width } = size;
  const style = {
    background,
    height,
    left: x,
    top: y,
    transitionDuration: animated ? `${animationDurationMs}ms` : undefined,
    width,
    zIndex
  };

  return (
    <div className={className} onMouseDown={selectHandler} style={style}>
      <TitleBar
        background={titleBackground}
        color={titleColor}
        frozen={frozen}
        showMaximizeButton={resizable}
        title={title}
        maximized={maximized}
        onClose={closeHandler}
        onMaximize={toggleMaximize}
        onMinimise={minimizeHandler}
        onMoveStart={onMoveStart}
      />
      <main className={cn(styles.content, { [styles.frozen]: frozen })}>
        {children}
      </main>
      {resizable && <ResizeArea onResizeStart={onResizeStart} />}
    </div>
  );
};

interface Props {
  active: boolean;
  background: string;
  keepContentRatio?: boolean;
  id: number;
  maxHeight?: number;
  maxWidth?: number;
  minHeight: number;
  minWidth: number;
  resizable?: boolean;
  title: string;
  titleBackground: string;
  titleColor: string;
  visible: boolean;
  zIndex: number;
  onClose(id: number): void;
  onMinimise(id: number): void;
  onResize?(size: Size): void;
  onSelect(id: number): void;
}
