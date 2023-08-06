import {
  createPortal,
  type JSX,
  type Ref,
  useCallback,
  useRef,
  useState,
} from 'preact/compat';
import { useDynamicRef } from '@/platform/hooks/useDynamicRef';
import { Tooltip, type TooltipProps } from './Tooltip';

export function useTooltip(initialTooltipProps: Partial<TooltipProps>): {
  hideTooltip(): unknown;
  showTooltip(props: Partial<TooltipProps>): unknown;
  tooltipElement: JSX.Element | null;
  tooltipRef: Ref<HTMLDivElement>;
} {
  const tooltipRef = useRef<HTMLDivElement>(null);
  const initialTooltipPropsRef = useDynamicRef(initialTooltipProps);
  const [tooltipProps, setTooltipProps] = useState<TooltipProps | undefined>();

  const tooltipElement = tooltipProps
    ? createPortal(
        <Tooltip {...tooltipProps} ref={tooltipRef} />,
        document.body,
      )
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

  return { hideTooltip, showTooltip, tooltipElement, tooltipRef };
}
