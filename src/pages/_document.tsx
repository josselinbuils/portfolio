import type { FunctionComponent } from 'preact';

interface DocumentProps {
  entryScriptUrl?: string;
}

const Document: FunctionComponent<DocumentProps> = ({
  children,
  entryScriptUrl,
}) => (
  <html lang="en">
    <head>
      <meta charSet="UTF-8" />
      <title>Josselin BUILS</title>
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <link
        rel="preload"
        // @ts-ignore
        // eslint-disable-next-line react/no-unknown-property
        fetchpriority="high"
        as="image"
        href="/assets/me.webp"
        type="image/webp"
      />
      <meta
        name="description"
        content="Hey, I'm Josselin, a full-stack JavaScript developer :)"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/assets/favicon16.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/assets/favicon32.png"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'http://schema.org/',
            '@type': 'Person',
            jobTitle: 'Software Engineer',
            name: 'Josselin BUILS',
            nationality: 'French',
          }),
        }}
      />
      <script
        defer
        src="https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver%2CResizeObserver"
      />
    </head>
    <body>
      <div id="app">{children}</div>
      {entryScriptUrl && <script type="module" src={entryScriptUrl} />}
    </body>
  </html>
);

export default Document;
