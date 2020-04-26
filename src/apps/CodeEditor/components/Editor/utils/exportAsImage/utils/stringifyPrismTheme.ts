export function stringifyPrismTheme(highlightedCode: string): string {
  const selectorMatch = highlightedCode.match(/class="([^ ]+)/);

  if (selectorMatch === null) {
    throw new Error('Unable to find a css class name in highlighted code');
  }

  const selector = `.${selectorMatch[1]}`;
  const styleSheets = Array.from(document.styleSheets) as CSSStyleSheet[];
  const rules = styleSheets.find((sheet) =>
    Array.from(sheet.rules).some(({ cssText }) => cssText.startsWith(selector))
  );

  if (rules === undefined) {
    throw new Error(`Unable to find Prism theme using selector ${selector}`);
  }

  return Array.from(rules.cssRules)
    .map((rule) => rule.cssText)
    .join('');
}
