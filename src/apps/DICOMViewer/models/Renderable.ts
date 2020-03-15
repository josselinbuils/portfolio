import { Subject } from '@josselinbuils/utils';

import { Model } from './Model';

export class Renderable extends Model {
  onUpdate!: Subject<void>;

  private dirty!: boolean;

  decorateProperties(): void {
    for (const [key, startValue] of Object.entries(this)) {
      let value = startValue;

      Object.defineProperty(this, key, {
        get(): any {
          return value;
        },
        set(newValue: any): void {
          if (newValue !== value) {
            value = newValue;

            if (value !== undefined && value.onUpdate !== undefined) {
              value.onUpdate.subscribe(() => this.makeDirty());
            }
            this.makeDirty();
          }
        }
      });
    }
    this.dirty = true;
    this.onUpdate = new Subject<void>();
  }

  fillProperties(config: any): void {
    for (const [key, value] of Object.entries(config)) {
      if (value !== undefined) {
        (this as any)[key] = value;

        if ((value as any).onUpdate !== undefined) {
          (value as Renderable).onUpdate.subscribe(() => this.makeDirty());
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
      if (
        propertyValue !== undefined &&
        typeof propertyValue.makeClean === 'function'
      ) {
        propertyValue.makeClean();
      }
    }
  }

  private makeDirty(): void {
    this.dirty = true;
    this.onUpdate.next();
  }
}
