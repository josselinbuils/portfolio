import { ENV_DEV, PORT_HTTP, PORT_WS } from './constants';
import { startHTTPServer } from './http/startHTTPServer';
import { Logger } from './Logger';
import { startWSServer } from './ws/startWSServer';

const ENV = process.env.NODE_ENV || ENV_DEV;

async function start(): Promise<void> {
  Logger.info(`Starts portfolio server in ${ENV} mode`);
  await startHTTPServer(PORT_HTTP);
  await startWSServer(PORT_WS);
  Logger.info('Portfolio successfully started');
}
start();
