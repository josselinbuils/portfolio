import { useContext } from 'preact/compat';
import { type MenuManager } from './MenuContext';
import { MenuContext } from './MenuContext';

export function useMenu(): MenuManager {
  return useContext(MenuContext);
}
