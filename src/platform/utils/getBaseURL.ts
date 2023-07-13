import { DEV_BASE_URL, PROD_BASE_URL } from '../constants';

export function getBaseURL(): string {
  return window.location.host.indexOf('localhost') === 0
    ? DEV_BASE_URL
    : PROD_BASE_URL;
}
