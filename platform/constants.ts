export const PROD_HOSTNAME = 'josselinbuils.me';
const PROD_BASE_PATH = '/portfolio-next';

export const BASE_URL =
  typeof window === 'undefined' ||
  window.location.host.indexOf('localhost') === 0
    ? 'http://localhost:3000'
    : `https://${PROD_HOSTNAME}${PROD_BASE_PATH}`;

export const BASE_URL_WS =
  typeof window === 'undefined' ||
  window.location.host.indexOf('localhost') === 0
    ? 'ws://localhost:3001'
    : `wss://${PROD_HOSTNAME}${PROD_BASE_PATH}`;

export enum MouseButton {
  Left = 0,
  Middle = 1,
  Right = 2,
}

export const ROOT_FONT_SIZE_PX = 10;
