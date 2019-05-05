export class Subject<T> {
  private subscriptions: ((value: T) => void)[] = [];
  private value: T | undefined;

  constructor(private defaultValue?: T) {
    this.value = defaultValue;
  }

  next(value: T): void {
    this.value = value;
    this.subscriptions.forEach(subscription => subscription(value));
  }

  subscribe(subscription: Subscription<T>): () => void {
    this.subscriptions.push(subscription);

    if (this.defaultValue !== undefined) {
      subscription(this.value as T);
    }

    return () => {
      const index = this.subscriptions.indexOf(subscription);
      this.subscriptions.splice(index, 1);
    };
  }
}

type Subscription<T> = (value: T) => void;
