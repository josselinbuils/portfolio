import packageFile from '~/package.json';

const { hostname, pathname } = new URL(packageFile.homepage);

export const PROD_HOSTNAME = hostname;
const PROD_BASE_PATH = pathname;
const PROD_BASE_URL = packageFile.homepage;

export const BASE_URL =
  typeof window === 'undefined' ||
  window.location.host.indexOf('localhost') === 0
    ? 'http://localhost:3000'
    : PROD_BASE_URL;

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
