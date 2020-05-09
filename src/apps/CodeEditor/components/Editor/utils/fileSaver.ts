import { EditorFile } from '../interfaces/EditorFile';

const STORAGE_KEY = 'codeEditor';

const defaultFiles = [
  {
    content: '',
    language: 'javascript',
    name: 'local.js',
  },
  {
    content: '',
    language: 'javascript',
    name: 'shared.js',
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
          ? storedFiles.splice(storedFileIndex, 1)[0]
          : file
      );
    }
    files.push(...storedFiles);

    return files;
  }
  return defaultFiles;
}

function saveFiles(files: EditorFile[]): void {
  files = files.filter(({ name }) => !name.includes('shared'));

  if (files.length > 0) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ files } as SaveState));
  } else {
    localStorage.removeItem(STORAGE_KEY);
  }
}

interface SaveState {
  files: EditorFile[];
}
