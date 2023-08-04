export function stringifyPrismTheme(highlightedCode: string): string {
  const classNames = Array.from(
    highlightedCode.matchAll(/class="([^" ]+)/g),
  ).map((match) => match[1]);

  if (classNames.length === 0) {
    return '';
  }

  const styleSheet = Array.from(document.styleSheets).find((sheet) =>
    Array.from(sheet.cssRules).some(({ cssText }) =>
      cssText.includes(classNames[0]),
    ),
  );

  if (styleSheet === undefined) {
    throw new Error(`Unable to find Prism theme.`);
  }

  return Array.from(styleSheet.cssRules)
    .filter((rule) =>
      classNames.some((className) => rule.cssText.includes(className)),
    )
    .map((rule) => rule.cssText)
    .join('');
}
