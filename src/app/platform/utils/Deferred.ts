export class Deferred<T> {
  promise: Promise<T>;
  reject!: (...args: any[]) => void;
  resolve!: (...args: any[]) => void;

  constructor() {
    this.promise = new Promise<T>((resolve, reject) => {
      this.resolve = resolve;
      this.reject = reject;
    });
  }
}
