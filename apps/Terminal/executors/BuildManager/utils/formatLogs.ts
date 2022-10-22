import type { Log } from '../Log';

let logId = -1;

export async function formatLogs(
  logs: Log[],
  stepClass: string
): Promise<Log[]> {
  const AnsiUp = (await import('ansi_up')).default;
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
