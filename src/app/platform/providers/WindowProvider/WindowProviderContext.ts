import { createContext } from 'react';
import { WindowManager } from './WindowManager';

export const WindowProviderContext = createContext<WindowManager | undefined>(
  undefined
);
