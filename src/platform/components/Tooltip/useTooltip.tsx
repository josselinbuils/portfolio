import { createPortal, type JSX, useCallback, useState } from 'preact/compat';
import { type Position } from '@/platform/interfaces/Position';
import { Tooltip, type TooltipProps } from './Tooltip';

export function useTooltip(tooltipProps: Omit<TooltipProps, 'position'>): {
  hideTooltip(): unknown;
  showTooltip(position: Position): unknown;
  tooltipElement: JSX.Element | null;
} {
  const [position, setPosition] = useState<Position>();

  const tooltipElement = position
    ? createPortal(
        <Tooltip {...tooltipProps} position={position} />,
        document.body,
      )
    : null;

  const hideTooltip = useCallback(() => setPosition(undefined), []);

  return { hideTooltip, tooltipElement, showTooltip: setPosition };
}
