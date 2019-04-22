const ANIMATION_DURATION = 200;
const DOM_UPDATE_DELAY = 10;

export function startAnimation(
  animationDuration: number = ANIMATION_DURATION
): Animation {
  let finished = () => {};
  let ready = () => {};

  const animation: Animation = {
    finished: (finishedCallback: () => void): Animation => {
      finished = finishedCallback;
      return animation;
    },
    ready: (readyCallback: () => void): Animation => {
      ready = readyCallback;
      return animation;
    }
  };

  setTimeout(() => {
    ready();
    setTimeout(finished, animationDuration + DOM_UPDATE_DELAY);
  }, DOM_UPDATE_DELAY);

  return animation;
}

interface Animation {
  finished(finishedCallback: () => void): Animation;
  ready(readyCallback: () => void): Animation;
}
