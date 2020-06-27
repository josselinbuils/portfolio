import Terminal from '~/apps/Terminal';
import { Home } from '~/platform/components/Home';
import { WindowManager } from '~/platform/services/WindowManager';

WindowManager.defaultApp = Terminal;

export default Home;
