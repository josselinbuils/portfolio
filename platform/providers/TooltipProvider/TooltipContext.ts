import { createContext } from 'react';
import type { TooltipDescriptor } from '../../components/Tooltip/TooltipDescriptor';

function throwError(): void {
  throw new Error('TooltipContext not initialized');
}

export const TooltipContext = createContext<{
  onEnterTooltipParent(
    descriptor: TooltipDescriptor,
    updateDescriptorOnDisplay?: () => TooltipDescriptor
  ): void;
  onLeaveTooltipParent(): void;
  onMoveTooltipParent(): void;
}>({
  onEnterTooltipParent: throwError,
  onLeaveTooltipParent: throwError,
  onMoveTooltipParent: throwError,
});
