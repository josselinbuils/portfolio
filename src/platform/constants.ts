export const PROD_HOSTNAME = 'josselinbuils.me';

export const BASE_URL =
  window.location.host.indexOf('localhost') === 0
    ? 'http://localhost:9000'
    : `https://${PROD_HOSTNAME}`;

export enum MouseButton {
  Left = 0,
  Middle = 1,
  Right = 2
}
