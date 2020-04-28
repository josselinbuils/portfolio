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

function insertText(field: HTMLTextAreaElement, str: string): void {
  const isSupported = document.execCommand('insertText', false, str);

  // Firefox, no undo/redo support
  if (!isSupported) {
    field.setRangeText(str, field.selectionStart, field.selectionEnd, 'end');
    field.dispatchEvent(new Event('input', { bubbles: true }));
  }
}
