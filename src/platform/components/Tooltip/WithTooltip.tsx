import { cloneElement, type FunctionComponent, type JSX } from 'preact';
import { Children, type PropsWithChildren } from 'preact/compat';

import { type TooltipProps } from '@/platform/components/Tooltip/Tooltip';

import { useTooltip } from './useTooltip';

export type WithTooltipProps = PropsWithChildren<
  Omit<TooltipProps, 'position'>
>;

export const WithTooltip: FunctionComponent<WithTooltipProps> = ({
  children,
  ...tooltipProps
}) => {
  const { hideTooltip, showTooltip, tooltipElement } = useTooltip(tooltipProps);
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
      const { height, right: x, y } = target.getBoundingClientRect();
      showTooltip({ position: { x, y: Math.round(y + height / 2) } });
      child.props.onMouseEnter?.(event);
    },
    onMouseLeave: (event: MouseEvent) => {
      hideTooltip();
      child.props.onMouseLeave?.(event);
    },
  });
};
