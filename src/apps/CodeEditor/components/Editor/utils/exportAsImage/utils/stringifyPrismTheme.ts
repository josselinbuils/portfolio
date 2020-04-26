export function stringifyPrismTheme(highlightedCode: string): string {
  const tokenClassNameMatch = highlightedCode.match(/class="([^" ]+)/);

  // No highlighted parts
  if (tokenClassNameMatch === null) {
    return '';
  }

  const tokenClassName = tokenClassNameMatch[1];
  const styleSheets = Array.from(document.styleSheets) as CSSStyleSheet[];
  const rules = styleSheets.find((sheet) =>
    Array.from(sheet.rules).some(({ cssText }) =>
      cssText.includes(tokenClassName)
    )
  );

  if (rules === undefined) {
    throw new Error(
      `Unable to find Prism theme using class '${tokenClassName}'`
    );
  }

  return Array.from(rules.cssRules)
    .filter((rule) => rule.cssText.includes(tokenClassName))
    .map((rule) => rule.cssText)
    .join('');
}
