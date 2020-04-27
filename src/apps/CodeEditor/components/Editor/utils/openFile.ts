const MAX_FILE_SIZE_BYTES = 50000;

export async function openFile(): Promise<
  { name: string; content: string } | undefined
> {
  return new Promise<{ name: string; content: string } | undefined>(
    (resolve, reject) => {
      const element = document.createElement('input');

      element.setAttribute('type', 'file');
      element.style.display = 'none';
      element.addEventListener('change', async (event: Event) => {
        const files = (event.target as HTMLInputElement).files;

        if (files === null) {
          resolve(undefined);
        } else {
          const file = files[0];

          if (file.size > MAX_FILE_SIZE_BYTES) {
            reject(new Error('File too large to be loaded'));
          } else {
            resolve({
              content: await readFile(file),
              name: file.name,
            });
          }
        }
      });

      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element);
    }
  );
}

async function readFile(file: File): Promise<string> {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Unable to read file'));
    reader.onload = (event) => resolve((event.target?.result as string) || '');
    reader.readAsText(file);
  });
}
