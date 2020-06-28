import Terminal from '~/apps/Terminal';
import { Home } from '~/platform/components/Home';
import { InjectorContext } from '~/platform/hooks/useInjector';
import { WindowManager } from '~/platform/services/WindowManager';

console.log('index page');

WindowManager.defaultApp = Terminal;

export default () => (
  <InjectorContext.Provider value={{}}>
    <Home />
  </InjectorContext.Provider>
);
