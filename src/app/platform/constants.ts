export const HTTP_PREFIX =
  window.location.host.indexOf('localhost') === 0
    ? 'http://localhost:9000'
    : '';

export const PROD_HOSTNAME = 'josselinbuils.me';

export enum MouseButton {
  Left = 0,
  Middle = 1,
  Right = 2
}
