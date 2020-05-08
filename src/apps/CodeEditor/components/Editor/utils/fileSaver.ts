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
    return (JSON.parse(stored) as SaveState)?.files || defaultFiles;
  }
  return defaultFiles;
}

function saveFiles(files: EditorFile[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ files } as SaveState));
}

interface SaveState {
  files: EditorFile[];
}
