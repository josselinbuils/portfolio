import { PROD_BASE_PATH, PROD_HOSTNAME } from '../constants';

export function getWSBaseURL(): string {
  return window.location.host.indexOf('localhost') === 0
    ? 'ws://localhost:3001'
    : `wss://${PROD_HOSTNAME}${PROD_BASE_PATH}`;
}
