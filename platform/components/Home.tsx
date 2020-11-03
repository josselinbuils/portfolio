import Head from 'next/head';
import { FC, useEffect } from 'react';
import { Desktop } from './Desktop/Desktop';
import { ContextMenuProvider } from '../providers/ContextMenuProvider/ContextMenuProvider';
import { useInjector } from '../providers/InjectorProvider/useInjector';
import { TooltipProvider } from '../providers/TooltipProvider/TooltipProvider';
import { WindowManager } from '../services/WindowManager/WindowManager';
import { getAppDescriptors } from '../utils/getAppDescriptors';

export const Home: FC<Props> = ({ app }) => {
  const windowManager = useInjector(WindowManager);

  useEffect(() => {
    if (app !== undefined) {
      const descriptor = getAppDescriptors()[app];

      if (descriptor !== undefined) {
        windowManager.openApp(descriptor, { startMaximized: true });
      }
    }
  }, [app, windowManager]);

  return (
    <>
      <Head>
        <title>Josselin BUILS</title>
        <meta
          name="description"
          content="Hey, I'm Josselin, a full-stack JavaScript developer :)"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: `\
{
  "@context": "http://schema.org/",
  "@type": "Person",
  "jobTitle": "Software Engineer",
  "name": "Josselin BUILS",
  "nationality": "French"
}`,
          }}
        />
        <script
          async
          src="https://polyfill.io/v3/polyfill.min.js?features=IntersectionObserver%2CResizeObserver"
        />
      </Head>
      <ContextMenuProvider>
        <TooltipProvider>
          <Desktop />
        </TooltipProvider>
      </ContextMenuProvider>
    </>
  );
};

interface Props {
  app?: string;
}
