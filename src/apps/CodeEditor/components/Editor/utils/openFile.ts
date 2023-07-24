import { type EditorFile } from '../interfaces/EditorFile';
import { getLanguageFromExtension } from './getLanguageFromExtension';

const MAX_FILE_SIZE_BYTES = 50000;

export async function openFile(file?: File): Promise<EditorFile | undefined> {
  if (file !== undefined) {
    if (file.size > MAX_FILE_SIZE_BYTES) {
      throw new Error('File too large to be loaded');
    }
    return readFile(file);
  }
  return new Promise<EditorFile | undefined>((resolve, reject) => {
    const element = document.createElement('input');

    element.setAttribute('type', 'file');
    element.style.display = 'none';
    element.addEventListener('change', async (event: Event) => {
      file = (event.currentTarget as HTMLInputElement).files?.[0];

      if (file === undefined) {
        resolve(undefined);
      } else if (file.size > MAX_FILE_SIZE_BYTES) {
        reject(new Error('File too large to be loaded'));
      } else {
        resolve(readFile(file));
      }
    });

    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  });
}

async function readFile(file: File): Promise<EditorFile> {
  return new Promise<EditorFile>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Unable to read file.'));
    reader.onload = (event) => {
      const extension = file.name.split('.').pop() ?? '';
      const language = getLanguageFromExtension(extension);

      if (language === undefined) {
        reject(new Error('Unsupported extension.'));
      } else {
        resolve({
          content: (event.target?.result as string) || '',
          language,
          name: file.name,
          shared: false,
        });
      }
    };
    reader.readAsText(file);
  });
}
