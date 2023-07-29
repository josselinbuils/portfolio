import cn from 'classnames';
import React, {
  Component,
  createRef,
  type JSX,
  type MutableRefObject,
  type PropsWithChildren,
} from 'preact/compat';
import { MouseButton } from '@/platform/constants';
import { type Size } from '@/platform/interfaces/Size';
import { TitleBar } from './TitleBar';
import styles from './Window.module.scss';

const BUTTONS_WIDTH = 66;
const MIN_USABLE_SIZE = 20;
const TOOLBAR_HEIGHT = 22;

export class Window extends Component<PropsWithChildren<WindowProps>, State> {
  visible = true;
  readonly windowRef = createRef<HTMLDialogElement>();

  private contentRatio?: number;
  private readonly contentRef = createRef<HTMLElement>();
  private readonly lastDisplayProperties: {
    maximize?: { height: number; left: number; top: number; width: number };
    minimize?: { height: number; left: number; top: number; width: number };
  } = {};

  constructor(props: WindowProps) {
    super(props);

    const { minHeight, minWidth } = this.props;

    this.state = {
      animated: false,
      height: `min(${minHeight / 10}rem, 100%)`,
      left: `max((100% - ${minWidth / 10}rem) * 0.5, 0rem)`,
      maximized: false,
      moving: false,
      minimized: false,
      resizing: false,
      top: `max((100% - ${minHeight / 10}rem) * 0.2, 0rem)`,
      width: `min(${minWidth / 10}rem, 100%)`,
    };
  }

  componentDidMount(): void {
    const { keepContentRatio, startMaximized } = this.props;

    if (startMaximized) {
      this.lastDisplayProperties.maximize = {
        ...this.getPosition(),
        ...this.getSize(),
      };
      this.setPosition(0, 0);
      this.setMaxSize();
      this.setState({ maximized: true });
    } else {
      const { minHeight, minWidth } = this.props;
      this.setSize(minWidth, minHeight);
    }

    if (keepContentRatio) {
      const contentSize = this.getContentSize();
      this.contentRatio = contentSize.width / contentSize.height;
    }
  }

  componentDidUpdate(prevProps: WindowProps): void {
    const { props, state } = this;

    if (state.maximized) {
      if (!props.resizable && prevProps.resizable) {
        // eslint-disable-next-line react/no-did-update-set-state
        this.setState({ maximized: false });
        delete this.lastDisplayProperties.maximize;
      }
      if (props.visibleAreaSize !== prevProps.visibleAreaSize) {
        this.setMaxSize();
      }
    }
    if (
      props.maxHeight !== prevProps.maxHeight ||
      props.maxWidth !== prevProps.maxWidth ||
      props.minHeight !== prevProps.minHeight ||
      props.minWidth !== prevProps.minWidth
    ) {
      this.createAnimation()
        .ready(() => {
          const { height, width } = this.getSize();
          this.setSize(width, height);
        })
        .start();
    }
  }

  focus(): void {
    this.windowRef.current?.focus();
  }

  hide(): void {
    const { props } = this;

    if (this.visible && this.windowRef.current !== null) {
      this.createAnimation()
        .ready(() => {
          this.lastDisplayProperties.minimize = {
            ...this.getPosition(),
            ...this.getSize(),
          };
          this.setState({ minimized: true });
          this.setSize(0, 0, true);
          if (props.minimizedTopPosition !== undefined) {
            this.setPosition(60, props.minimizedTopPosition);
          }
        })
        .finished(() => {
          this.visible = false;
        })
        .start();
    }
  }

  render(): JSX.Element {
    const {
      contentRef,
      props,
      isFrozen,
      startMove,
      startResize,
      state,
      toggleMaximize,
      unselectIfNoChildFocused,
      windowRef,
    } = this;
    const {
      active,
      children,
      className,
      id,
      onClose,
      onMinimise,
      onSelect,
      resizable = true,
      title,
      titleBackground,
      titleColor,
      zIndex,
    } = props;
    const { animated, height, left, maximized, minimized, top, width } = state;
    const frozen = isFrozen();

    return (
      // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
      <dialog
        aria-label={`Window: ${title}`}
        className={cn(
          styles.window,
          {
            [styles.active]: active,
            [styles.animated]: animated,
            [styles.frozen]: frozen,
            [styles.maximized]: maximized,
            [styles.minimized]: minimized,
          },
          className,
        )}
        onBlur={unselectIfNoChildFocused}
        onFocus={() => onSelect(id)}
        onMouseDown={() => onSelect(id)}
        ref={windowRef}
        style={{ height, left, top, width, zIndex }}
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
          onMoveStart={startMove}
          // Don't know why but cannot remove the arrow function there
          onToggleMaximize={() => toggleMaximize()}
        />
        <main
          className={cn(styles.content, { [styles.frozen]: frozen })}
          ref={contentRef}
        >
          {children}
        </main>
        {resizable && (
          <button
            aria-hidden
            aria-label="Window resize corner"
            className={styles.resize}
            onMouseDown={startResize}
            tabIndex={-1}
            type="button"
          />
        )}
      </dialog>
    );
  }

  show(): void {
    if (!this.visible && this.lastDisplayProperties.minimize !== undefined) {
      this.createAnimation()
        .ready(() => {
          if (this.lastDisplayProperties.minimize !== undefined) {
            const { left, top, width, height } =
              this.lastDisplayProperties.minimize;

            this.setState({ minimized: false });
            this.setSize(width, height);
            this.setPosition(left, top, true);
          }
        })
        .finished(() => {
          this.visible = true;
        })
        .start();
    }
  }

  startMove = (downEvent: MouseEvent): void => {
    if (downEvent.button !== MouseButton.Left) {
      return;
    }

    downEvent.preventDefault();

    const windowElement = this.windowRef.current as HTMLElement;
    const dy = windowElement.offsetTop - downEvent.clientY;
    let dx = windowElement.offsetLeft - downEvent.clientX;
    let isUnmaximazing = false;
    const lastMoveEventRef = createRef() as MutableRefObject<MouseEvent>;

    const moveHandler = (moveEvent: MouseEvent) => {
      if (
        moveEvent.clientX === downEvent.clientX &&
        moveEvent.clientY === downEvent.clientY
      ) {
        return;
      }
      const { state } = this;

      lastMoveEventRef.current = moveEvent;

      if (!state.moving) {
        this.setState({ moving: true });
        return;
      }

      if (
        !isUnmaximazing &&
        this.lastDisplayProperties.maximize !== undefined
      ) {
        const widthRatio =
          this.lastDisplayProperties.maximize.width / windowElement.clientWidth;

        // Keeps the same position on the title bar in proportion to its width
        const { offsetX } = downEvent;
        dx +=
          offsetX * widthRatio > BUTTONS_WIDTH
            ? offsetX * (1 - widthRatio)
            : offsetX - BUTTONS_WIDTH;

        isUnmaximazing = true;

        this.toggleMaximize(
          true,
          () => {
            this.setPosition(downEvent.clientX + dx, downEvent.clientY + dy);
          },
          () => {
            isUnmaximazing = false;
            this.setStyle('transform', '');
            this.setPosition(
              lastMoveEventRef.current.clientX + dx,
              lastMoveEventRef.current.clientY + dy,
            );
          },
        );
      }

      if (isUnmaximazing) {
        this.setStyle(
          'transform',
          `translate(${(moveEvent.clientX - downEvent.clientX) / 10}rem, ${
            (moveEvent.clientY - downEvent.clientY) / 10
          }rem)`,
        );
      } else {
        this.setPosition(moveEvent.clientX + dx, moveEvent.clientY + dy);
      }
    };

    const upHandler = () => {
      this.setState({ moving: false });
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('mouseup', upHandler);
    };

    window.addEventListener('mousemove', moveHandler);
    window.addEventListener('mouseup', upHandler);
  };

  startResize = (downEvent: MouseEvent): void => {
    if (downEvent.button !== MouseButton.Left) {
      return;
    }
    let { state } = this;

    downEvent.preventDefault();

    if (state.maximized) {
      return;
    }

    const startSize = this.getSize();

    const moveHandler = (moveEvent: MouseEvent) => {
      const width = startSize.width + moveEvent.clientX - downEvent.clientX;
      const height = startSize.height + moveEvent.clientY - downEvent.clientY;
      ({ state } = this); // State reference will change if not yet frozen

      if (!state.resizing) {
        this.setState({ resizing: true });
        return;
      }

      this.setSize(width, height);
    };

    const upHandler = () => {
      const size = this.getSize();
      this.setSize(size.width, size.height);
      this.setState({ resizing: false });
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('mouseup', upHandler);
    };

    window.addEventListener('mousemove', moveHandler);
    window.addEventListener('mouseup', upHandler);
  };

  toggleMaximize = (
    keepPosition = false,
    onReady: () => void = () => {},
    onFinished: () => void = () => {},
  ): void => {
    const { props, state } = this;
    if (props.resizable === false) {
      return;
    }
    this.createAnimation()
      .ready(() => {
        onReady();

        if (
          state.maximized &&
          this.lastDisplayProperties.maximize !== undefined
        ) {
          const { height, left, top, width } =
            this.lastDisplayProperties.maximize;

          this.setState({ maximized: false });

          if (!keepPosition) {
            this.setPosition(left, top);
          }
          this.setSize(width, height, true);

          delete this.lastDisplayProperties.maximize;
        } else {
          this.lastDisplayProperties.maximize = {
            ...this.getPosition(),
            ...this.getSize(),
          };

          if (!keepPosition) {
            this.setPosition(0, 0);
          }
          this.setMaxSize();
        }
      })
      .finished(() => {
        if (this.lastDisplayProperties.maximize !== undefined) {
          this.setState({ maximized: true });
        }
        onFinished();
      })
      .start();
  };

  private createAnimation(): WindowAnimation {
    let finished: () => void;
    let ready: () => void;

    const windowAnimation: WindowAnimation = {
      finished: (finishedCallback: () => void): WindowAnimation => {
        finished = finishedCallback;
        return windowAnimation;
      },
      ready: (readyCallback: () => void): WindowAnimation => {
        ready = readyCallback;
        return windowAnimation;
      },
      start: () => {
        const windowElement = this.windowRef.current;

        const transitionEndListener = () => {
          windowElement?.removeEventListener(
            'transitionend',
            transitionEndListener,
          );
          this.setState({ animated: false }, () => {
            if (typeof finished === 'function') {
              finished();
            }
          });
        };
        windowElement?.addEventListener('transitionend', transitionEndListener);

        this.setState({ animated: true }, () => {
          if (typeof ready === 'function') {
            ready();
          }
        });
      },
    };
    return windowAnimation;
  }

  private getContentSize(): { height: number; width: number } {
    const contentElement = this.contentRef.current;
    let width = 0;
    let height = 0;

    if (contentElement !== null) {
      width = contentElement.clientWidth;
      height = contentElement.clientHeight;
    }
    return { height, width };
  }

  private getPosition(): { left: number; top: number } {
    const windowElement = this.windowRef.current;
    let left = 0;
    let top = 0;

    if (windowElement !== null) {
      left = windowElement.offsetLeft;
      top = windowElement.offsetTop;
    }
    return { left, top };
  }

  private isFrozen = (): boolean => {
    const { animated, moving, resizing } = this.state;
    return animated || moving || resizing;
  };

  private getSize(): { width: number; height: number } {
    const windowElement = this.windowRef.current;
    let width = 0;
    let height = 0;

    if (windowElement !== null) {
      width = windowElement.clientWidth;
      height = windowElement.clientHeight;
    }
    return { height, width };
  }

  private setMaxSize(): void {
    const { visibleAreaSize } = this.props;

    if (visibleAreaSize !== undefined) {
      const { height, width } = visibleAreaSize;
      this.setSize(width, height, true);
    }
  }

  private setPosition(x: number, y: number, force = false): void {
    const { visibleAreaSize } = this.props;

    if (!force && visibleAreaSize !== undefined) {
      // This cannot be done when showing again a minimized window because its dimensions are null
      const xMin = -this.getSize().width + MIN_USABLE_SIZE;
      const yMin = 0;
      const xMax = visibleAreaSize.width - BUTTONS_WIDTH - MIN_USABLE_SIZE;
      const yMax = visibleAreaSize.height - TOOLBAR_HEIGHT;

      x = Math.min(Math.max(x, xMin), xMax);
      y = Math.min(Math.max(y, yMin), yMax);
    }

    x = Math.round(x);
    y = Math.round(y);

    if (this.isFrozen()) {
      this.setStyle('left', `${x / 10}rem`);
      this.setStyle('top', `${y / 10}rem`);
    } else {
      this.setState({
        left: `${x / 10}rem`,
        top: `${y / 10}rem`,
      });
    }
  }

  private setSize(width: number, height: number, force = false): void {
    const {
      maxHeight,
      maxWidth,
      minHeight,
      minWidth,
      onResize,
      visibleAreaSize,
    } = this.props;
    const frozen = this.isFrozen();

    if (visibleAreaSize === undefined) {
      return;
    }

    if (!force) {
      width = Math.max(width, minWidth);
      height = Math.max(height, minHeight);

      if (maxWidth !== undefined) {
        width = Math.min(width, maxWidth);
      }

      if (maxHeight !== undefined) {
        height = Math.min(height, maxHeight);
      }

      width = Math.min(width, visibleAreaSize.width);
      height = Math.min(height, visibleAreaSize.height);

      if (typeof this.contentRatio === 'number') {
        const size = this.getSize();
        const contentSize = this.getContentSize();
        const dx = size.width - contentSize.width;
        const dy = size.height - contentSize.height;
        height = Math.round((width - dx) / this.contentRatio) + dy;
      }
    }

    if (frozen) {
      this.setStyle('width', `${width / 10}rem`);
      this.setStyle('height', `${height / 10}rem`);
    } else {
      this.setState({
        width: `${width / 10}rem`,
        height: `${height / 10}rem`,
      });
    }

    if (onResize !== undefined) {
      onResize({ width, height });
    }
  }

  private setStyle(key: string, value: any): void {
    const windowElement = this.windowRef.current;

    if (windowElement !== null) {
      windowElement.style[key as any] = value;
    }
  }

  private unselectIfNoChildFocused = ({ currentTarget }: FocusEvent): void => {
    const windowRef = this.windowRef.current;

    if (
      !windowRef ||
      currentTarget === windowRef ||
      windowRef?.contains(currentTarget as Node | null)
    ) {
      return;
    }

    // Waits for next element to take focus
    setTimeout(() => {
      if (!this.windowRef.current?.contains(document.activeElement)) {
        const { id, onUnselect } = this.props;
        onUnselect(id);
      }
    }, 0);
  };
}

export interface WindowProps {
  active: boolean;
  className?: string;
  keepContentRatio?: boolean;
  id: number;
  maxHeight?: number;
  maxWidth?: number;
  minHeight: number;
  minimizedTopPosition?: number;
  minWidth: number;
  resizable?: boolean;
  startMaximized?: boolean;
  title: string;
  titleBackground?: string;
  titleColor: string;
  visibleAreaSize: Size | undefined;
  zIndex: number;
  onClose(id: number): void;
  onMinimise(id: number): void;
  onResize?(size: Size): void;
  onSelect(id: number): void;
  onUnselect(id: number): void;
}

interface State {
  animated: boolean;
  height: string;
  left: string;
  maximized: boolean;
  moving: boolean;
  minimized: boolean;
  resizing: boolean;
  top: string;
  width: string;
}

interface WindowAnimation {
  finished(finishedCallback: () => void): WindowAnimation;

  ready(readyCallback: () => void): WindowAnimation;

  start(): void;
}
