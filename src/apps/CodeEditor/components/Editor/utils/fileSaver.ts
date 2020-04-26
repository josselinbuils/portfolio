import { File } from '../File';

const STORAGE_KEY = 'codeEditor';
const DEFAULT_FILENAME = 'local.js';

export const fileSaver = {
  loadFiles,
  saveFiles,
};

function loadFiles(): File[] {
  const stored = localStorage.getItem(STORAGE_KEY);
  const defaultFiles = [{ name: DEFAULT_FILENAME, content: '' }];

  if (stored !== null) {
    return (JSON.parse(stored) as SaveState)?.files || defaultFiles;
  }
  return defaultFiles;
}

function saveFiles(files: File[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ files } as SaveState));
}

interface SaveState {
  files: File[];
}
