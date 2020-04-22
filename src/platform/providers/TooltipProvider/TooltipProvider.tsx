import React, { FC, useState } from 'react';
import { Tooltip, TooltipDescriptor } from '~/platform/components/Tooltip';
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
