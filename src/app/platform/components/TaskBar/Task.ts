import { createRef, ElementType, RefObject } from 'react';
import { WindowInstance } from '~/platform/providers/WindowProvider';

export class Task {
  private static id = -1;

  iconClass: string;
  id: string;
  name: string;
  ref: RefObject<HTMLDivElement>;

  constructor(
    public component: ElementType,
    public pinned: boolean = false,
    public instance?: WindowInstance
  ) {
    this.iconClass = (this.component as any).iconClass;
    this.id = `task_${++Task.id}`;
    this.name = (this.component as any).appName;
    this.ref = createRef();
  }
}
