import Terminal from '~/apps/Terminal';
import { WindowManager } from '~/platform/services/WindowManager';
import { Home } from './Home';

WindowManager.defaultApp = Terminal;

export default Home;
