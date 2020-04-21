export const docExec = {
  forwardDelete,
  insertText,
};

function forwardDelete(): void {
  document.execCommand('forwardDelete', false);
}

function insertText(str: string): void {
  document.execCommand('insertText', false, str);
}
