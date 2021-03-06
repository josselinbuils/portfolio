import { DEV_BASE_URL, PROD_BASE_URL } from '../constants';

export const ENV_DEV = 'development';
export const ENV_PROD = 'production';

export const BASE_URL =
  process.env.NODE_ENV !== ENV_PROD ? DEV_BASE_URL : PROD_BASE_URL;

export const ASSETS_DIR = 'public/assets';
export const ASSETS_URL = `${BASE_URL}/assets`;
export const HTTP_INTERNAL_ERROR = 500;
export const HTTP_NOT_FOUND = 404;
export const PORT_WS = 3001;
