import { lazy } from '@/platform/utils/lazy';
import { type EditorFile } from '../interfaces/EditorFile';

const STORAGE_KEY = 'codeEditor';

const defaultFiles: EditorFile[] = [
  {
    content: `\
// Rewrite the for loop without the await keyword and keep the same behaviour

(async () => {
  for (let i = 0; i < 5; i++) {
    await sleep(i * 1000);
    console.log(i);
  }
})();

function sleep(timeMs: number) {
  return new Promise((resolve) => setTimeout(resolve, timeMs));
}
`,
    language: 'typescript',
    name: 'shared.ts',
    shared: true,
  },
  {
    content: `\
/*
 * Hello 🖖 Today, we will try to beat the computer in a Tic Tac Toe game!
 *
 * When it is your turn to play, you will receive the grid which is an array of
 * arrays (1 by line) containing the following marks:
 * - 'x' is the mark of the computer.
 * - 'o' is your mark.
 * - '' is an empty case.
 *
 * Here is an example of grid:
 * [
 *   ['o', '', ''], // Row 1
 *   ['', 'x', ''], // Row 2
 *   ['x', '', ''], // Row 3
 * ]
 *
 * The goal is to implement an AI to beat the computer 🏅
 */

type Mark = 'x' | 'o' | '';
type Grid = [[Mark, Mark, Mark], [Mark, Mark, Mark], [Mark, Mark, Mark]];

interface Window {
  ticTacToe: {
    onMyTurn(callback: (grid: Grid) => unknown): void;
    placeMyMark(x: number, y: number): void;
    start(): void;
  };
}

const { onMyTurn, placeMyMark, start } = window.ticTacToe;

onMyTurn((grid) => {
  for (let i = 0; i < 3; i++) {
    if (grid[i][0] === 'x' && grid[i][1] === 'x' && grid[i][2] === '') {
      placeMyMark(2, i);
      return;
    } else if (grid[i][0] === 'x' && grid[i][1] === '' && grid[i][2] === 'x') {
      placeMyMark(1, i);
      return;
    } else if (grid[i][0] === '' && grid[i][1] === 'x' && grid[i][2] === 'x') {
      placeMyMark(0, i);
      return;
    }
  }
  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 3; j++) {
      if (grid[i][j] === '') {
        placeMyMark(j, i);
        return;
      }
    }
  }
});

start();
`,
    language: 'typescript',
    name: 'ticTacToe.ts',
    shared: true,
    SideComponent: lazy(
      async () => (await import('../games/TicTacToe/TicTacToe')).TicTacToe,
    ),
  },
  {
    content: '',
    language: 'javascript',
    name: 'local.js',
    shared: false,
  },
];

export const fileSaver = {
  defaultFiles,
  loadFiles,
  saveFiles,
};

function loadFiles(): EditorFile[] {
  const stored = localStorage.getItem(STORAGE_KEY);

  if (stored !== null) {
    const files = [];
    const storedFiles = (JSON.parse(stored) as SaveState)?.files || [];

    // Reorders the default files if it changed
    for (const file of defaultFiles) {
      const storedFileIndex = storedFiles.findIndex(
        ({ name }) => name === file.name,
      );

      files.push(
        storedFileIndex !== -1
          ? { ...file, ...storedFiles.splice(storedFileIndex, 1)[0] }
          : file,
      );
    }
    files.push(...storedFiles);

    return files;
  }
  return defaultFiles;
}

function saveFiles(files: EditorFile[]): void {
  files = files.filter(({ shared }) => !shared);

  const saveState: SaveState = {
    files: files.map(({ SideComponent, ...file }) => file),
  };

  if (files.length > 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveState));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

interface SaveState {
  files: Omit<EditorFile, 'sideComponent'>[];
}
