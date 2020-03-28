import React from 'react';
import { Desktop, NoScriptAlert } from '~/platform/components';
import { ContextMenuProvider } from '~/platform/providers';

export const App = () => (
  <ContextMenuProvider>
    <Desktop />
    <NoScriptAlert />
  </ContextMenuProvider>
);
