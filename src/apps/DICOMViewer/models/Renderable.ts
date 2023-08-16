import { Subject } from '@josselinbuils/utils/Subject';
import { Model } from './Model';

export class Renderable extends Model {
  onUpdate!: Subject<string>;

  private dirty!: boolean;

  decorateProperties(): void {
    const self = this;

    for (const [key, startValue] of Object.entries(this)) {
      let value = startValue;

      Object.defineProperty(this, key, {
        get(): any {
          return value;
        },
        set(newValue: any): void {
          if (newValue !== value) {
            value = newValue;

            if (isRenderable(value)) {
              value.onUpdate.subscribe(() => self.makeDirty(key));
            }
            self.makeDirty(key);
          }
        },
      });
    }
    this.dirty = true;
    this.onUpdate = new Subject();
  }

  fillProperties<ChildType>(config: Partial<ChildType>): void {
    for (const [key, value] of Object.entries(config)) {
      if (value !== undefined) {
        (this as any)[key] = value;

        if (isRenderable(value)) {
          value.onUpdate.subscribe(() => this.makeDirty(key));
        }
      }
    }
  }

  isDirty(): boolean {
    return this.dirty;
  }

  makeClean(): void {
    this.dirty = false;

    for (const propertyValue of Object.values(this)) {
      if (isRenderable(propertyValue)) {
        propertyValue.makeClean();
      }
    }
  }

  private makeDirty(key: string): void {
    this.dirty = true;
    this.onUpdate.next(key);
  }
}

function isRenderable(value: unknown): value is Renderable {
  return (value as Renderable)?.onUpdate !== undefined;
}
