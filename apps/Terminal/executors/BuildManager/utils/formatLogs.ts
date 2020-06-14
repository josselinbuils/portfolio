import AnsiUp from 'ansi_up';
import { Log } from '../Log';

let logId = -1;

export function formatLogs(logs: Log[], stepClass: string): Log[] {
  const ansiUp = new AnsiUp();

  return logs.map(({ data, level, time }) => ({
    data: ansiUp
      .ansi_to_html(data)
      .replace(
        /\[(\d+)]/g,
        (_$0: string, $1: string) => `<span class="${stepClass}">${$1}</span>`
      ),
    id: ++logId,
    level,
    time,
  }));
}
