import { Deferred } from '@josselinbuils/utils';

export function cancelable<T>(
  basePromise: Promise<T>
): [Promise<T>, () => void] {
  const { promise, reject, resolve } = new Deferred<T>();
  let active = true;

  basePromise
    .then((value) => {
      if (active) {
        resolve(value);
      }
    })
    .catch((reason) => {
      if (active) {
        reject(reason);
      }
    });

  return [promise, () => (active = false)];
}
