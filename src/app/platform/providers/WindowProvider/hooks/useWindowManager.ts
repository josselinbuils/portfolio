import { useContext } from 'react';
import { WindowManager } from '../WindowManager';
import { WindowProviderContext } from '../WindowProvider';

export function useWindowManager(): WindowManager {
  const windowManager = useContext(WindowProviderContext);

  if (windowManager === undefined) {
    throw Error('Unable to retrieve windowManager');
  }
  return windowManager;
}
