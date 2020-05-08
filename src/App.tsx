import React from 'react';
import { Desktop } from './platform/components/Desktop';
import { NoScriptAlert } from './platform/components/NoScriptAlert';
import { ContextMenuProvider } from './platform/providers/ContextMenuProvider/ContextMenuProvider';
import { TooltipProvider } from './platform/providers/TooltipProvider/TooltipProvider';

export const App = () => (
  <ContextMenuProvider>
    <TooltipProvider>
      <Desktop />
      <NoScriptAlert />
    </TooltipProvider>
  </ContextMenuProvider>
);
