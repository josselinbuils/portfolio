import {
  Children,
  cloneElement,
  type FC,
  type JSX,
  type PropsWithChildren,
} from 'preact/compat';
import { type TooltipProps } from '@/platform/components/Tooltip/Tooltip';
import { useTooltip } from './useTooltip';

export type WithTooltipProps = PropsWithChildren<
  Omit<TooltipProps, 'position'>
>;

export const WithTooltip: FC<WithTooltipProps> = ({
  children,
  ...tooltipProps
}) => {
  const { hideTooltip, tooltipElement, showTooltip } = useTooltip(tooltipProps);
  const child = Children.only(children) as JSX.Element;

  if (tooltipElement && child.props.disabled) {
    hideTooltip();
  }

  return cloneElement(child, {
    children: (
      <>
        {child.props.children}
        {tooltipElement}
      </>
    ),
    onMouseEnter: (event: MouseEvent) => {
      const target = event.currentTarget as HTMLElement;
      const { right: x, y, height } = target.getBoundingClientRect();
      showTooltip({ x, y: Math.round(y + height / 2) });
      child.props.onMouseEnter?.(event);
    },
    onMouseLeave: (event: MouseEvent) => {
      hideTooltip();
      child.props.onMouseLeave?.(event);
    },
  });
};
