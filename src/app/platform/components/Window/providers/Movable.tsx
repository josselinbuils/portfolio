import React, {
  FC,
  MutableRefObject,
  ReactElement,
  RefObject,
  useRef,
  useState
} from 'react';
import { useDragAndDrop } from '~/platform/hooks';
import { Position, Size } from '~/platform/interfaces';
import { noop } from '~/platform/utils';
import { boundPosition } from '../utils';

export const Movable: FC<Props> = ({
  children,
  minimizedTopPosition = 0,
  size,
  visibleAreaSize,
  windowRef
}) => {
  const [moving, setMoving] = useState(false);
  const [position, setPosition] = useState<Position>(() => ({
    x: Math.round((visibleAreaSize.width - size.width) * 0.5),
    y: Math.round((visibleAreaSize.height - size.height) * 0.2)
  }));
  const [unmaximizePosition, setUnmaximizePosition] = useState<Position>();
  const [unminimizePosition, setUnminimizePosition] = useState<Position>();
  const onMoveStartRef = useRef<(downEvent: React.MouseEvent) => void>(noop);

  function clearUnmaximizePosition(): void {
    setUnmaximizePosition(undefined);
  }

  onMoveStartRef.current = useDragAndDrop(
    (downEvent: React.MouseEvent) => {
      const windowStyle = (windowRef.current as HTMLElement).style;
      const dx = position.x - downEvent.clientX;
      const dy = position.y - downEvent.clientY;

      return (moveEvent: MouseEvent) => {
        const { x, y } = boundPosition(
          moveEvent.clientX + dx,
          moveEvent.clientY + dy,
          visibleAreaSize,
          size.width
        );
        windowStyle.left = `${x}px`;
        windowStyle.top = `${y}px`;

        if (!moving) {
          setMoving(true);
        }
      };
    },
    () => {
      const { left, top } = (windowRef.current as HTMLElement).style;

      setMoving(false);
      setPosition({
        x: parseInt(left as string, 10),
        y: parseInt(top as string, 10)
      });
    }
  );

  function resetPosition(): void {
    if (unminimizePosition !== undefined) {
      setPosition(unminimizePosition);
      setUnminimizePosition(undefined);
    } else if (unmaximizePosition !== undefined) {
      setPosition(unmaximizePosition);
      setUnmaximizePosition(undefined);
    }
  }

  function setMaximizedPosition(): void {
    setUnmaximizePosition(position);
    setPosition({ x: 0, y: 0 });
  }

  function setMinimizedPosition(): void {
    setUnminimizePosition(position);
    setPosition({ x: 0, y: minimizedTopPosition });
  }

  return children({
    clearUnmaximizePosition,
    moving,
    onMoveStartRef,
    position,
    resetPosition,
    setMaximizedPosition,
    setMinimizedPosition,
    setPosition
  });
};

interface Props {
  minimizedTopPosition?: number;
  size: Size;
  visibleAreaSize: Size;
  windowRef: RefObject<HTMLElement>;
  children(movableProps: MovableProps): ReactElement;
}

export interface MovableProps {
  moving: boolean;
  onMoveStartRef: MutableRefObject<(downEvent: React.MouseEvent) => void>;
  position: Position;
  clearUnmaximizePosition(): void;
  resetPosition(): void;
  setMaximizedPosition(): void;
  setMinimizedPosition(): void;
  setPosition(position: Position): void;
}
