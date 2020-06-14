import { createContext } from 'react';
import { TooltipDescriptor } from '../../components/Tooltip/TooltipDescriptor';

export const TooltipContext = createContext<TooltipDescriptorSetter>(() => {
  throw new Error('TooltipContext not initialized');
});

export type TooltipDescriptorSetter = (
  descriptor: TooltipDescriptor | undefined
) => void;
