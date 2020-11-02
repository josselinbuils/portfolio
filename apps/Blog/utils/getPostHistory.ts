import childProcess from 'child_process';
import path from 'path';

export function getPostHistory(
  filename: string
): {
  commitHash: string;
  commitSubject: string;
  commitTimestamp: number;
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
          commitTimestamp: parseInt(result[1], 10) * 1000,
        };
      });
  } catch (error) {
    console.error(error);
    return [];
  }
}
