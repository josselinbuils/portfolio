export class ExecQueue {
  private busy!: boolean;
  private readonly tasks: Task[] = [];

  enqueue(task: Task): void {
    if (!this.busy) {
      this.exec(task);
    } else {
      this.tasks.push(task);
    }
  }

  private async exec(task: Task): Promise<void> {
    this.busy = true;
    await task();

    if (this.tasks.length > 0) {
      await this.exec(this.tasks.shift() as Task);
    } else {
      this.busy = false;
    }
  }
}

type Task = () => void | Promise<void>;
