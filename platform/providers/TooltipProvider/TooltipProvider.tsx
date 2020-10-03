import { FC, useState } from 'react';
import { Tooltip } from '~/platform/components/Tooltip/Tooltip';
import { TooltipDescriptor } from '../../components/Tooltip/TooltipDescriptor';
import { TooltipContext } from './TooltipContext';

export const TooltipProvider: FC = ({ children }) => {
  const [descriptor, setDescriptor] = useState<TooltipDescriptor>();

  return (
    <TooltipContext.Provider value={setDescriptor}>
      {children}
      {descriptor && <Tooltip key={descriptor.id} {...descriptor} />}
    </TooltipContext.Provider>
  );
};
