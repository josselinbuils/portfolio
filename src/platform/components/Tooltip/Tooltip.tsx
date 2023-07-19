import cn from 'classnames';
import { type CSSProperties, type JSX, type FC } from 'preact/compat';
import { ROOT_FONT_SIZE_PX } from '@/platform/constants';
import type { Position } from '@/platform/interfaces/Position';
import styles from './Tooltip.module.scss';

export interface TooltipProps {
  className?: string;
  position: Position;
  style?: CSSProperties;
  title: string | JSX.Element;
}

export const Tooltip: FC<TooltipProps> = ({
  className,
  position,
  style,
  title,
}) => {
  const { x, y } = position;

  return (
    <div
      className={cn(styles.tooltip, className)}
      style={{
        ...style,
        left: typeof x === 'string' ? x : `${x / ROOT_FONT_SIZE_PX}rem`,
        top: typeof y === 'string' ? y : `${y / ROOT_FONT_SIZE_PX}rem`,
      }}
    >
      {title}
    </div>
  );
};