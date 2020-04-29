import { EditorFile } from '../interfaces';

const STORAGE_KEY = 'codeEditor';
const DEFAULT_FILENAME = 'local.js';
const DEFAULT_LANGUAGE = 'javascript';

export const fileSaver = {
  loadFiles,
  saveFiles,
};

function loadFiles(): EditorFile[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  const defaultFiles = [
    {
      content: '',
      language: DEFAULT_LANGUAGE,
      name: DEFAULT_FILENAME,
    },
  ];

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
