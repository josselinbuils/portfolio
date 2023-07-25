import { makeKeysHumanReadable, normaliseKeys } from '@/platform/utils/keys';

export function showShortcuts(): void {
  console.log(
    makeKeysHumanReadable(
      normaliseKeys(`\
Shortcuts:
- [[Alt+Shift+ArrowDown]]: move line down.
- [[Alt+Shift+ArrowUp]]: move line up.
- [[CtrlCmd+:]] or [[CtrlCmd+/]]: comment.
- [[CtrlCmd+D]]: duplicate line or selection.
- [[CtrlCmd+E]]: execute.
- [[CtrlCmd+P]]: new file.
- [[CtrlCmd+O]]: open file.
- [[CtrlCmd+S]]: format code.
- [[Shift+Tab]]: unindent.
- [[Tab]]: indent.
`),
    ),
  );
}
