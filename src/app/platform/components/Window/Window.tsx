import cn from 'classnames';
import React, {
  CSSProperties,
  FC,
  RefObject,
  useEffect,
  useRef,
  useState
} from 'react';
import { useDragAndDrop } from '~/platform/hooks';
import { Position, Size } from '~/platform/interfaces';
import { noop } from '~/platform/utils';
import {
  ANIMATION_DURATION,
  ANIMATION_DURATION_FAST,
  VERTICAL_OFFSET_TO_UNMAXIMIZE
} from './constants';
import { useAnimation, useSize } from './hooks';
import { TitleBar } from './TitleBar';
import { boundPosition, getRelativeOffset, getSize } from './utils';
import styles from './Window.module.scss';

export const Window: FC<Props> = ({
  active,
  background,
  children,
  keepContentRatio = false,
  id,
  maxHeight = Infinity,
  maxWidth = Infinity,
  minHeight,
  minimizedTopPosition,
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
  visibleAreaRef,
  zIndex
}) => {
  const [frozen, setFrozen] = useState(false);
  const [unmaximizeProps, setUnmaximizeProps] = useState<Position & Size>();
  const [unminimizeProps, setUnminimizeProps] = useState<Position & Size>();
  const windowRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLMainElement>(null);
  const [animationDurationMs, animate] = useAnimation();
  const [size, setSize] = useSize(
    { maxHeight, maxWidth, minHeight, minWidth },
    keepContentRatio,
    visibleAreaRef,
    windowRef,
    contentRef,
    onResize
  );
  const visibleAreaSize = getSize(visibleAreaRef);
  const [position, setPosition] = useState<Position>(() => ({
    x: Math.round((visibleAreaSize.width - size.width) * 0.5),
    y: Math.round((visibleAreaSize.height - size.height) * 0.2)
  }));
  const maximized = unmaximizeProps !== undefined;
  const minimized = size.width === 0 && size.height === 0;

  function maximize(): void {
    if (!resizable) {
      return;
    }

    animate(ANIMATION_DURATION);
    setUnmaximizeProps({ ...position, ...size });
    setPosition({ x: 0, y: 0 });
  }

  function toggleMaximize(): void {
    if (!resizable) {
      return;
    }
    if (unmaximizeProps !== undefined) {
      unmaximize();
    } else {
      maximize();
    }
  }

  function unmaximize(keepPosition: boolean = false): Size {
    if (unmaximizeProps === undefined) {
      return size;
    }
    const { height, width, x, y } = unmaximizeProps;

    animate(keepPosition ? ANIMATION_DURATION_FAST : ANIMATION_DURATION);

    if (!keepPosition) {
      const position = boundPosition(x, y, visibleAreaSize, width);
      setPosition(position);
    }
    setUnmaximizeProps(undefined);
    return setSize(width, height);
  }

  const moveStartHandler = useDragAndDrop(
    (downEvent: MouseEvent) => {
      const windowStyle = (windowRef.current as HTMLDivElement).style;
      const dy = position.y - downEvent.clientY;

      let dx = position.x - downEvent.clientX;
      let shouldToggleMaximize = false;
      let width = size.width;

      setFrozen(true);

      if (unmaximizeProps !== undefined) {
        const nextWidth = unmaximizeProps.width;
        dx += getRelativeOffset(downEvent, visibleAreaSize.width, nextWidth);
        shouldToggleMaximize = true;
      }

      return (moveEvent: MouseEvent) => {
        if (
          shouldToggleMaximize &&
          moveEvent.clientY < downEvent.clientY + VERTICAL_OFFSET_TO_UNMAXIMIZE
        ) {
          return;
        }
        if (shouldToggleMaximize) {
          width = unmaximize(true).width;
          shouldToggleMaximize = false;
        }

        const { x, y } = boundPosition(
          moveEvent.clientX + dx,
          moveEvent.clientY + dy,
          visibleAreaSize,
          width
        );

        windowStyle.left = `${x}px`;
        windowStyle.top = `${y}px`;
      };
    },
    () => {
      const { left, top } = (windowRef.current as HTMLDivElement).style;

      setFrozen(false);
      setPosition({
        x: parseInt(left as string, 10),
        y: parseInt(top as string, 10)
      });
    }
  );

  const resizeStartHandler = useDragAndDrop(
    (downEvent: MouseEvent) => {
      if (maximized) {
        return;
      }
      setFrozen(true);

      return (moveEvent: MouseEvent) => {
        const width = size.width + moveEvent.clientX - downEvent.clientX;
        const height = size.height + moveEvent.clientY - downEvent.clientY;
        setSize(width, height);
      };
    },
    () => setFrozen(false)
  );

  useEffect(() => {
    if (!visible) {
      if (unminimizeProps === undefined) {
        animate(ANIMATION_DURATION);
        setUnminimizeProps({ ...position, ...size });
        setSize(0, 0, true);
        setPosition(position);
        setPosition({ x: 0, y: minimizedTopPosition || 0 });
      }
    } else if (unminimizeProps !== undefined) {
      const { height, width, x, y } = unminimizeProps;
      animate(ANIMATION_DURATION);
      setUnminimizeProps(undefined);
      setSize(width, height);
      setPosition({ x, y });
    }
  }, [
    animate,
    minimizedTopPosition,
    position,
    setSize,
    size,
    unminimizeProps,
    visible
  ]);

  const animated = animationDurationMs !== undefined;
  const className = cn(styles.window, {
    [styles.active]: active,
    [styles.animated]: animated,
    [styles.maximized]: maximized,
    [styles.minimized]: minimized
  });
  const style: CSSProperties = { background, zIndex };

  if (animated) {
    style.transitionDuration = `${animationDurationMs}ms`;
  }

  if (!maximized) {
    const { x, y } = position;
    const { height, width } = size;

    style.height = height;
    style.left = x;
    style.top = y;
    style.width = width;
  }

  return (
    <div
      className={className}
      onMouseDown={() => onSelect(id)}
      ref={windowRef}
      style={style}
    >
      <TitleBar
        background={titleBackground}
        color={titleColor}
        frozen={frozen}
        showMaximizeButton={resizable}
        title={title}
        maximized={maximized}
        onClose={() => onClose(id)}
        onMinimise={() => onMinimise(id)}
        onMoveStart={moveStartHandler}
        onToggleMaximize={toggleMaximize}
      />
      <main
        className={cn(styles.content, { [styles.frozen]: frozen })}
        ref={contentRef}
      >
        {children}
      </main>
      {resizable && (
        <div className={styles.resize} onMouseDown={resizeStartHandler} />
      )}
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
  minimizedTopPosition?: number;
  minWidth: number;
  resizable?: boolean;
  title: string;
  titleBackground?: string;
  titleColor: string;
  visible: boolean;
  visibleAreaRef: RefObject<HTMLElement>;
  zIndex: number;
  onClose(id: number): void;
  onMinimise(id: number): void;
  onResize?(size: Size): void;
  onSelect(id: number): void;
}
