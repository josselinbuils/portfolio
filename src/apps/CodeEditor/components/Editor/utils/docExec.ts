export const docExec = {
  delete: _delete,
  forwardDelete,
};

function _delete(): void {
  document.execCommand('delete', false);
}

function forwardDelete(): void {
  document.execCommand('forwardDelete', false);
}
