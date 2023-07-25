function isMacOs() {
  return navigator.platform.startsWith('Mac');
}

export function getKeyFromEvent({
  altKey,
  ctrlKey,
  key,
  metaKey,
  shiftKey,
}: KeyboardEvent): string {
  let eventKeyStr = altKey && key !== 'Alt' ? 'Alt+' : '';

  eventKeyStr += ctrlKey && key !== 'Control' ? 'Control+' : '';
  eventKeyStr += metaKey && key !== 'Meta' ? 'Meta+' : '';
  eventKeyStr += shiftKey && key !== 'Shift' ? 'Shift+' : '';
  eventKeyStr += key.length === 1 ? key.toUpperCase() : key;

  return eventKeyStr;
}

export function makeKeysHumanReadable(input: string): string {
  let humanReadableInput = input.replace(/Control/g, 'Ctrl');

  if (isMacOs()) {
    humanReadableInput = humanReadableInput.replace(/Meta/g, 'Cmd');
  }
  return humanReadableInput;
}

export function normaliseKeys(input: string): string {
  return input.replace(/CtrlCmd/g, isMacOs() ? 'Meta' : 'Control');
}
