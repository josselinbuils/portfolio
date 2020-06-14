import Head from 'next/head';
import Terminal from '~/apps/Terminal';
import { Desktop } from '~/platform/components/Desktop';
import { ContextMenuProvider } from '~/platform/providers/ContextMenuProvider/ContextMenuProvider';
import { TooltipProvider } from '~/platform/providers/TooltipProvider/TooltipProvider';
import { WindowManager } from '~/platform/services/WindowManager';

WindowManager.defaultApp = Terminal;

const Index = () => (
  <>
    <Head>
      <meta charSet="utf-8" />
      <title>Josselin BUILS</title>
      <link
        rel="apple-touch-icon"
        sizes="180x180"
        href="/favicon/apple-touch-icon.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="32x32"
        href="/favicon/favicon-32x32.png"
      />
      <link
        rel="icon"
        type="image/png"
        sizes="16x16"
        href="/favicon/favicon-16x16.png"
      />
      <link rel="manifest" href="/favicon/site.webmanifest" />
      <meta
        name="description"
        content="Hey, I'm Josselin, a full-stack JavaScript developer :)"
      />
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <link
        type="text/plain"
        rel="author"
        href="https://josselinbuils.me/humans.txt"
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: `\
    {
      '@context': 'http://schema.org/',
      '@type': 'Person',
      jobTitle: 'Software Engineer',
      name: 'Josselin BUILS',
      nationality: 'French',
    }`,
        }}
      />
      <script
        async
        src="https://polyfill.io/v3/polyfill.min.js?features=ResizeObserver"
      />
    </Head>
    <ContextMenuProvider>
      <TooltipProvider>
        <Desktop />
      </TooltipProvider>
    </ContextMenuProvider>
  </>
);

export default Index;
