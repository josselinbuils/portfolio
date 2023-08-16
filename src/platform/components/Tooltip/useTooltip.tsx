import {
  createPortal,
  type JSX,
  type Ref,
  useCallback,
  useLayoutEffect,
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

  useLayoutEffect(() => {
    const tooltipDomElement = tooltipRef.current;

    if (tooltipProps !== undefined && tooltipDomElement !== null) {
      const { bottom, right } = tooltipDomElement.getBoundingClientRect();
      let correctedX: number | undefined;
      let correctedY: number | undefined;

      if (right > window.innerWidth) {
        correctedX = tooltipProps.position.x - right + window.innerWidth;
      }

      if (bottom > window.innerHeight) {
        correctedY = tooltipProps.position.y - bottom + window.innerHeight;
      }

      if (correctedX !== undefined || correctedY !== undefined) {
        setTooltipProps({
          ...tooltipProps,
          position: {
            x: correctedX ?? tooltipProps.position.x,
            y: correctedY ?? tooltipProps.position.y,
          },
        });
      }
    }
  }, [tooltipProps]);

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
