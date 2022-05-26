export function showShortcuts(): void {
  console.log(`\
Shortcuts:
- [[Alt+Shift+ArrowDown]]: move down.
- [[Alt+Shift+ArrowUp]]: move up.
- [[Ctrl+:]] or [[Ctrl+/]] or [[Cmd+:]] or [[Cmd+/]]: comment.
- [[Ctrl+D]] or [[Cmd+D]]: duplicate.
- [[Ctrl+E]] or [[Cmd+E]]: execute.
- [[Ctrl+N]] or [[Cmd+N]]: open new tab.
- [[Ctrl+O]] or [[Cmd+O]]: open file.
- [[Ctrl+S]] or [[Cmd+S]]: format code.
- [[Shift+Tab]]: unindent.
- [[Tab]]: indent.
`);
}
