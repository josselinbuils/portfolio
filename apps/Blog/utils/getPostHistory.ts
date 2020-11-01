import childProcess from 'child_process';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import path from 'path';

dayjs.extend(relativeTime);

export function getPostHistory(
  filename: string
): {
  commitDate: string;
  commitHash: string;
  commitSubject: string;
}[] {
  try {
    return childProcess
      .execSync(
        `git log --follow --no-merges --name-only --format="%H %ct %s" -p ${path.join(
          process.cwd(),
          'apps/Blog/posts',
          filename
        )}`
      )
      .toString()
      .trim()
      .split('\n')
      .filter((line) => line && !line.includes(filename.split('/')[1]))
      .map((line) => {
        const result = line.split(' ');
        return {
          commitHash: result[0],
          commitSubject: result.slice(2).join(' '),
          commitDate: dayjs(parseInt(result[1], 10) * 1000).fromNow(),
        };
      });
  } catch (error) {
    console.error(error);
    return [];
  }
}
