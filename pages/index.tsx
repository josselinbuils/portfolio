import Terminal from '~/apps/Terminal';
import { Home } from '~/platform/components/Home';
import { WindowManager } from '~/platform/services/WindowManager';

console.log('index page');

WindowManager.defaultApp = Terminal;

export default Home;
