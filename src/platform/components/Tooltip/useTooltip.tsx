import { createPortal, type JSX, useCallback, useState } from 'preact/compat';
import { useDynamicRef } from '@/platform/hooks/useDynamicRef';
import { Tooltip, type TooltipProps } from './Tooltip';

// TODO fix position if partially hidden because of screen limits
export function useTooltip(initialTooltipProps: Partial<TooltipProps>): {
  hideTooltip(): unknown;
  showTooltip(props: Partial<TooltipProps>): unknown;
  tooltipElement: JSX.Element | null;
} {
  const initialTooltipPropsRef = useDynamicRef(initialTooltipProps);
  const [tooltipProps, setTooltipProps] = useState<TooltipProps | undefined>();

  const tooltipElement = tooltipProps
    ? createPortal(<Tooltip {...tooltipProps} />, document.body)
    : null;

  const hideTooltip = useCallback(() => setTooltipProps(undefined), []);
  const showTooltip = useCallback(
    (props: Partial<TooltipProps>) =>
      setTooltipProps({
        ...initialTooltipPropsRef.current,
        ...props,
      } as TooltipProps),
    [initialTooltipPropsRef],
  );

  return { hideTooltip, showTooltip, tooltipElement };
}
