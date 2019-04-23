import { Deferred } from '~/platform/utils';

import { ANIMATION_DURATION, DOM_UPDATE_DELAY } from '../../constants';

export function startAnimation(
  setAnimate: (animate: boolean) => void,
  animationDuration: number = ANIMATION_DURATION
): Promise<[Promise<void>]> {
  const readiness = new Deferred<[Promise<void>]>();
  const end = new Deferred<void>();

  setAnimate(true);

  setTimeout(() => {
    readiness.resolve([end.promise]);

    setTimeout(() => {
      end.resolve();
      setAnimate(false);
    }, animationDuration + DOM_UPDATE_DELAY);
  }, DOM_UPDATE_DELAY);

  return readiness.promise;
}
