import { type JSX } from 'preact/compat';
import { type QuickInfo, type SymbolDisplayPart } from 'typescript';
import { highlightCode } from '@/apps/CodeEditor/utils/highlightCode/highlightCode';

export function renderQuickInfo(quickInfo: QuickInfo): JSX.Element {
  const { displayParts, documentation } = quickInfo;
  const body = mergeParts(documentation);

  return (
    <>
      <section>
        {highlightCode(mergeParts(displayParts), 'typescript', 'react')}
      </section>
      {body && (
        <section style={{ marginTop: '1.2rem' }}>
          {renderMarkdownLinks(body)}
        </section>
      )}
    </>
  );
}

function mergeParts(parts: SymbolDisplayPart[] | undefined) {
  return parts?.map((part) => part.text).join('') ?? '';
}

function renderMarkdownLinks(input: string): JSX.Element {
  const markdownLinkSplitRegex = /(\[[^\]]+]\([^)]+\))/; // Parentheses are necessary for the split to keep delimiters
  const markdownLinkPartsRegex = /\[([^\]]+)]\(([^)]+)\)/;

  return (
    <>
      {input.split(markdownLinkSplitRegex).map((part) => {
        const match = part.match(markdownLinkPartsRegex);
        return match !== null ? (
          <a href={match[2]} rel="noreferrer" target="_blank">
            {match[1]}
          </a>
        ) : (
          part
        );
      })}
    </>
  );
}
