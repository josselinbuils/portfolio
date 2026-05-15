import type { FunctionComponent } from 'preact';

type DocumentProps = {
  entryScriptUrl?: string;
};

const Document: FunctionComponent<DocumentProps> = ({
  children,
  entryScriptUrl,
}) => (
  <html lang="en">
    <head>
      <meta charSet="UTF-8" />
      <title>Josselin BUILS</title>
      <meta content="width=device-width, initial-scale=1.0" name="viewport" />
      <link
        as="image"
        fetchPriority="high"
        href="/assets/me.webp"
        rel="preload"
        type="image/webp"
      />
      <meta
        content="Hey, I'm Josselin, a full-stack JavaScript developer :)"
        name="description"
      />
      <link
        href="/assets/favicon16.png"
        rel="icon"
        sizes="16x16"
        type="image/png"
      />
      <link
        href="/assets/favicon32.png"
        rel="icon"
        sizes="32x32"
        type="image/png"
      />
      <script
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'http://schema.org/',
            '@type': 'Person',
            jobTitle: 'Software Engineer',
            name: 'Josselin BUILS',
            nationality: 'French',
          }),
        }}
        type="application/ld+json"
      />
      <script
        defer
        src="https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver%2CResizeObserver"
      />
    </head>
    <body>
      <div id="app">{children}</div>
      {entryScriptUrl && <script src={entryScriptUrl} type="module" />}
    </body>
  </html>
);

export default Document;
