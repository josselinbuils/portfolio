export const docExec = {
  delete: _delete,
  forwardDelete,
  insertText,
};

function _delete(): void {
  document.execCommand('delete', false);
}

function forwardDelete(): void {
  document.execCommand('forwardDelete', false);
}

function insertText(str: string): void {
  document.execCommand('insertText', false, str);
}
