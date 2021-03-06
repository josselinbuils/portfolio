import packageFile from '~/package.json';

const { hostname } = new URL(packageFile.homepage);

export enum MouseButton {
  Left = 0,
  Middle = 1,
  Right = 2,
}

export const DEV_BASE_HOST = 'localhost:3000';
export const DEV_BASE_URL = `http://${DEV_BASE_HOST}`;
export const PROD_HOSTNAME = hostname;
export const PROD_BASE_URL = packageFile.homepage;
export const ROOT_FONT_SIZE_PX = 10;
