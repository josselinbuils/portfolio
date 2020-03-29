import cn from 'classnames';
import React, { Component, createRef, ReactElement } from 'react';
import { MouseButton } from '~/platform/constants';
import { Size } from '~/platform/interfaces';
import { TitleBar } from './TitleBar';

import styles from './Window.module.scss';

const ANIMATION_DURATION = 200;
const BUTTONS_WIDTH = 66;
const DOM_UPDATE_DELAY = 10;
const MIN_USABLE_SIZE = 20;
const TOOLBAR_HEIGHT = 22;

export class Window extends Component<Props, State> {
  visible = true;

  private contentRatio?: number;
  private readonly contentRef = createRef<HTMLElement>();
  private readonly lastDisplayProperties: {
    maximize?: { height: number; left: number; top: number; width: number };
    minimize?: { height: number; left: number; top: number; width: number };
  } = {};
  private readonly windowRef = createRef<HTMLDivElement>();

  constructor(props: Props) {
    super(props);
    this.state = {
      animated: false,
      frozen: false,
      maximized: false,
      minimized: false,
    };
  }

  componentDidUpdate(prevProps: Props): void {
    if (!this.props.resizable && prevProps.resizable && this.state.maximized) {
      this.setState({ maximized: false });
      delete this.lastDisplayProperties.maximize;
    }
    if (
      this.props.maxHeight !== prevProps.maxHeight ||
      this.props.maxWidth !== prevProps.maxWidth ||
      this.props.minHeight !== prevProps.minHeight ||
      this.props.minWidth !== prevProps.minWidth
    ) {
      this.startAnimation().ready(() => {
        const { height, width } = this.getSize();
        this.setSize(width, height);
      });
    }
  }

  componentDidMount(): void {
    const { keepContentRatio, minHeight, minWidth } = this.props;

    this.setSize(minWidth, minHeight);
    this.setStyle('left', `calc(50% - ${minWidth / 20}rem)`);
    this.setStyle('top', `calc((100% - ${minHeight / 20}rem) * 0.2)`);

    if (keepContentRatio) {
      const contentSize = this.getContentSize();
      this.contentRatio = contentSize.width / contentSize.height;
    }
  }

  hide(): void {
    if (this.visible && this.windowRef.current !== null) {
      this.startAnimation()
        .ready(() => {
          this.lastDisplayProperties.minimize = {
            ...this.getPosition(),
            ...this.getSize(),
          };
          this.setState({ minimized: true });
          this.setSize(0, 0, true);
          if (this.props.minimizedTopPosition !== undefined) {
            this.setPosition(60, this.props.minimizedTopPosition);
          }
        })
        .finished(() => (this.visible = false));
    }
  }

  render(): ReactElement {
    const {
      active,
      background,
      children,
      id,
      onClose,
      onMinimise,
      onSelect,
      resizable = true,
      title,
      titleBackground,
      titleColor,
      zIndex,
    } = this.props;
    const { animated, frozen, maximized, minimized } = this.state;

    const className = cn(styles.window, {
      [styles.active]: active,
      [styles.animated]: animated,
      [styles.frozen]: frozen,
      [styles.maximized]: maximized,
      [styles.minimized]: minimized,
    });

    return (
      <div
        className={className}
        onMouseDown={() => onSelect(id)}
        ref={this.windowRef}
        style={{ background, zIndex }}
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
          onMoveStart={this.startMove}
          onToggleMaximize={() => this.toggleMaximize()}
        />
        <main
          className={cn(styles.content, {
            [styles.frozen]: animated || frozen,
          })}
          ref={this.contentRef}
        >
          {children}
        </main>
        {resizable && (
          <div className={styles.resize} onMouseDown={this.startResize} />
        )}
      </div>
    );
  }

  show(): void {
    if (!this.visible && this.lastDisplayProperties.minimize !== undefined) {
      this.startAnimation()
        .ready(() => {
          if (this.lastDisplayProperties.minimize !== undefined) {
            const {
              left,
              top,
              width,
              height,
            } = this.lastDisplayProperties.minimize;

            this.setState({ minimized: false });
            this.setSize(width, height);
            this.setPosition(left, top, true);
          }
        })
        .finished(() => (this.visible = true));
    }
  }

  startMove = (downEvent: React.MouseEvent): void => {
    if (downEvent.button !== MouseButton.Left) {
      return;
    }

    downEvent.preventDefault();
    downEvent.persist();

    const windowElement = this.windowRef.current as HTMLElement;
    const dy = windowElement.offsetTop - downEvent.clientY;
    let dx = windowElement.offsetLeft - downEvent.clientX;
    let isUnmaximazing = false;
    let lastMoveEvent: MouseEvent;

    const moveHandler = (moveEvent: MouseEvent) => {
      if (
        moveEvent.clientX === downEvent.clientX &&
        moveEvent.clientY === downEvent.clientY
      ) {
        return;
      }
      lastMoveEvent = moveEvent;

      if (!this.state.frozen) {
        this.setState({ frozen: true });
      }

      if (
        !isUnmaximazing &&
        this.lastDisplayProperties.maximize !== undefined
      ) {
        const widthRatio =
          this.lastDisplayProperties.maximize.width / windowElement.clientWidth;

        // Keeps the same position on the title bar in proportion to its width
        const { offsetX } = downEvent.nativeEvent;
        dx +=
          offsetX * widthRatio > BUTTONS_WIDTH
            ? offsetX * (1 - widthRatio)
            : offsetX - BUTTONS_WIDTH;

        isUnmaximazing = true;

        this.toggleMaximize(
          true,
          () =>
            this.setPosition(moveEvent.clientX + dx, moveEvent.clientY + dy),
          () => {
            isUnmaximazing = false;
            this.setStyle('transform', '');
            this.setPosition(
              lastMoveEvent.clientX + dx,
              lastMoveEvent.clientY + dy
            );
          }
        );
      }

      if (isUnmaximazing) {
        this.setStyle(
          'transform',
          `translate(${(moveEvent.clientX - downEvent.clientX) / 10}rem, ${
            (moveEvent.clientY - downEvent.clientY) / 10
          }rem)`
        );
      } else {
        this.setPosition(moveEvent.clientX + dx, moveEvent.clientY + dy);
      }
    };

    const upHandler = () => {
      this.setState({ frozen: false });
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('mouseup', upHandler);
    };

    window.addEventListener('mousemove', moveHandler);
    window.addEventListener('mouseup', upHandler);
  };

  startResize = (downEvent: React.MouseEvent): void => {
    if (downEvent.button !== MouseButton.Left) {
      return;
    }

    downEvent.preventDefault();
    downEvent.persist();

    if (this.state.maximized) {
      return;
    }

    const startSize = this.getSize();

    const moveHandler = (moveEvent: MouseEvent) => {
      const width = startSize.width + moveEvent.clientX - downEvent.clientX;
      const height = startSize.height + moveEvent.clientY - downEvent.clientY;

      if (!this.state.frozen) {
        this.setState({ frozen: true });
      }

      this.setSize(width, height);
    };

    const upHandler = () => {
      const size = this.getSize();
      this.setSize(size.width, size.height);
      this.setState({ frozen: false });
      window.removeEventListener('mousemove', moveHandler);
      window.removeEventListener('mouseup', upHandler);
    };

    window.addEventListener('mousemove', moveHandler);
    window.addEventListener('mouseup', upHandler);
  };

  toggleMaximize = (
    keepPosition: boolean = false,
    onReady: () => void = () => {},
    onFinished: () => void = () => {}
  ): void => {
    if (this.props.resizable === false) {
      return;
    }
    this.startAnimation()
      .ready(() => {
        onReady();

        if (
          this.state.maximized &&
          this.lastDisplayProperties.maximize !== undefined
        ) {
          const {
            height,
            left,
            top,
            width,
          } = this.lastDisplayProperties.maximize;

          this.setState({ maximized: false });

          if (!keepPosition) {
            this.setPosition(left, top);
          }
          this.setSize(width, height);

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
      });
  };

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

  private setPosition(x: number, y: number, force: boolean = false): void {
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

    this.setStyle('left', `${x / 10}rem`);
    this.setStyle('top', `${y / 10}rem`);
  }

  private setSize(width: number, height: number, force: boolean = false): void {
    const { maxHeight, maxWidth, minHeight, minWidth, onResize } = this.props;

    if (!force) {
      width = Math.max(width, minWidth);
      height = Math.max(height, minHeight);

      if (maxWidth !== undefined) {
        width = Math.min(width, maxWidth);
      }

      if (maxHeight !== undefined) {
        height = Math.min(height, maxHeight);
      }

      if (typeof this.contentRatio === 'number') {
        const size = this.getSize();
        const contentSize = this.getContentSize();
        const dx = size.width - contentSize.width;
        const dy = size.height - contentSize.height;
        height = Math.round((width - dx) / this.contentRatio) + dy;
      }
    }

    this.setStyle('width', `${width / 10}rem`);
    this.setStyle('height', `${height / 10}rem`);

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

  private startAnimation(): WindowAnimation {
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
    };

    this.setState({ animated: true }, () =>
      setTimeout(() => {
        if (typeof ready === 'function') {
          ready();
        }

        setTimeout(() => {
          this.setState({ animated: false });

          if (typeof finished === 'function') {
            finished();
          }
        }, ANIMATION_DURATION + DOM_UPDATE_DELAY);
      }, DOM_UPDATE_DELAY)
    );

    return windowAnimation;
  }
}

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
  visibleAreaSize: Size | undefined;
  zIndex: number;
  onClose(id: number): void;
  onMinimise(id: number): void;
  onResize?(size: Size): void;
  onSelect(id: number): void;
}

interface State {
  animated: boolean;
  frozen: boolean;
  maximized: boolean;
  minimized: boolean;
}

interface WindowAnimation {
  finished(finishedCallback: () => void): WindowAnimation;

  ready(readyCallback: () => void): WindowAnimation;
}
