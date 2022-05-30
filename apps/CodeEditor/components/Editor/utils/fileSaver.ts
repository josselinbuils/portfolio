import dynamic from 'next/dynamic';
import { EditorFile } from '../interfaces/EditorFile';

export const SHARED_FILENAME = 'ticTacToe.js';
const STORAGE_KEY = 'codeEditor';

const defaultFiles: EditorFile[] = [
  {
    content: '',
    language: 'javascript',
    name: SHARED_FILENAME,
    SideComponent: dynamic(
      async () => (await import('../../../games/TicTacToe/TicTacToe')).TicTacToe
    ),
  },
  {
    content: '',
    language: 'javascript',
    name: 'local.js',
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
        ({ name }) => name === file.name
      );

      files.push(
        storedFileIndex !== -1
          ? { ...file, ...storedFiles.splice(storedFileIndex, 1)[0] }
          : file
      );
    }
    files.push(...storedFiles);

    return files;
  }
  return defaultFiles;
}

function saveFiles(files: EditorFile[]): void {
  files = files.filter(({ name }) => name !== SHARED_FILENAME);

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
