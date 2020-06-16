import { DEV_BASE_HOST, PROD_HOSTNAME } from '../constants';

export function getWSBaseURL(): string {
  return window.location.host.indexOf('localhost') === 0
    ? `ws://${DEV_BASE_HOST}`
    : `wss://${PROD_HOSTNAME}`;
}
