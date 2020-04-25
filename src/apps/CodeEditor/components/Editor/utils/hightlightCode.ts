import Prism from 'prismjs';
import 'prismjs/components/prism-javascript.min';

export function highlightCode(code: string): string {
  const highlighted = Prism.highlight(
    code,
    Prism.languages.javascript,
    'javascript'
  );

  return (highlighted.slice(-1) === '\n'
    ? `${highlighted} `
    : highlighted
  ).replace(new RegExp('punctuation">;', 'g'), 'keyword">;');
}
