export function download(filename: string, base64Content: string): void {
  const element = document.createElement('a');
  element.setAttribute('href', base64Content);
  element.setAttribute('download', filename);
  element.style.display = 'none';
  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}
