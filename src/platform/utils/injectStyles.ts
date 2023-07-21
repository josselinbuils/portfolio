// Borrowed and modified from https://github.com/egoist/style-inject

const HASHED_CLASS_NAME_REGEX = /\.([a-zA-Z0-9-_]{6,7})/gm;
const STYLE_ID = 'injected-styles';

export function injectStyles(css: string | undefined) {
  if (!css) return;

  const head = document.head || document.getElementsByTagName('head')[0];
  let style = document.getElementById(STYLE_ID);

  // Create an unique sets of IDs
  const existingStyleIds = style
    ? new Set(style.innerHTML.match(HASHED_CLASS_NAME_REGEX))
    : new Set();
  const cssStylesToAdd = [...new Set(css.match(HASHED_CLASS_NAME_REGEX))];

  if (!style) {
    style = document.createElement('style');
    style.id = STYLE_ID;
    style.innerHTML = css;

    if (head.firstChild) {
      head.insertBefore(style, head.firstChild);
    } else {
      head.appendChild(style);
    }
  } else if (!existingStyleIds.has(cssStylesToAdd[0])) {
    // If the style we want to add is already in the page don't add it
    style.appendChild(document.createTextNode(`\n${css}`));
  }
}
