import {
  Children,
  cloneElement,
  createPortal,
  type FC,
  type JSX,
  type PropsWithChildren,
  useState,
} from 'preact/compat';
import {
  Tooltip,
  type TooltipProps,
} from '@/platform/components/Tooltip/Tooltip';
import { type Position } from '@/platform/interfaces/Position';

export type WithTooltipProps = PropsWithChildren<
  Omit<TooltipProps, 'position'>
>;

export const WithTooltip: FC<WithTooltipProps> = ({
  children,
  ...descriptor
}) => {
  const [position, setPosition] = useState<Position>();
  const child = Children.only(children) as JSX.Element;

  if (position && child.props.disabled) {
    setPosition(undefined);
  }

  return cloneElement(child, {
    children: (
      <>
        {child.props.children}
        {position &&
          createPortal(
            <Tooltip {...descriptor} position={position} />,
            document.body,
          )}
      </>
    ),
    onMouseEnter: (event: MouseEvent) => {
      const target = event.currentTarget as HTMLElement;
      const { right: x, y, height } = target.getBoundingClientRect();
      setPosition({ x, y: Math.round(y + height / 2) });
      child.props.onMouseEnter?.(event);
    },
    onMouseLeave: (event: MouseEvent) => {
      setPosition(undefined);
      child.props.onMouseLeave?.(event);
    },
  });
};
