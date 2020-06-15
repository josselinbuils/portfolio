import { DEV_BASE_HOST, PROD_BASE_PATH, PROD_HOSTNAME } from '../constants';

export function getWSBaseURL(): string {
  return window.location.host.indexOf('localhost') === 0
    ? `ws://${DEV_BASE_HOST}`
    : `wss://${PROD_HOSTNAME}${PROD_BASE_PATH}`;
}
