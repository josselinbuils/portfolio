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
