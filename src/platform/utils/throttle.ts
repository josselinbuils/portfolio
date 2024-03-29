export function throttle(
  func: (...args: any[]) => any,
  delayMs: number,
): (...args: any[]) => any {
  let lastCallTime = Date.now();
  let lastArgs: any[];
  let timeout: number | undefined;

  function call(this: any): any {
    lastCallTime = Date.now();
    timeout = undefined;
    func.apply(this, lastArgs);
  }

  return function throttled(...args: any[]): any {
    const now = Date.now();

    lastArgs = args;

    if (timeout === undefined) {
      timeout = window.setTimeout(
        call,
        Math.max(lastCallTime + delayMs - now, 0),
      );
    }
  };
}
