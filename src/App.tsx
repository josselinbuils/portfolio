import React from 'react';
import { Desktop, NoScriptAlert } from '~/platform/components';
import { ContextMenuProvider, TooltipProvider } from '~/platform/providers';

export const App = () => (
  <ContextMenuProvider>
    <TooltipProvider>
      <Desktop />
      <NoScriptAlert />
    </TooltipProvider>
  </ContextMenuProvider>
);
