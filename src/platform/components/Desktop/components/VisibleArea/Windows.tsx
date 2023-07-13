import { type FC } from 'preact/compat';
import { useEffect, useState } from 'preact/compat';
import { type Size } from '@/platform/interfaces/Size';
import { useInjector } from '@/platform/providers/InjectorProvider/useInjector';
import { type WindowInstance } from '@/platform/services/WindowManager/WindowInstance';
import { WindowManager } from '@/platform/services/WindowManager/WindowManager';

export const Windows: FC<Props> = ({ visibleAreaSize }) => {
  const windowManager = useInjector(WindowManager);
  const [windowInstances, setWindowInstances] = useState<WindowInstance[]>(() =>
    windowManager.getWindowInstances(),
  );

  useEffect(
    () => windowManager.windowInstancesSubject.subscribe(setWindowInstances),
    [windowManager],
  );

  return (
    <>
      {windowInstances.map(
        ({ id, windowComponent: WindowComponent, ...forwardedProps }) => (
          <WindowComponent
            key={id}
            id={id}
            onClose={windowManager.closeWindow}
            onMinimise={windowManager.hideWindow}
            onSelect={windowManager.selectWindow}
            onUnselect={windowManager.unselectWindow}
            visibleAreaSize={visibleAreaSize}
            {...forwardedProps}
          />
        ),
      )}
    </>
  );
};

interface Props {
  visibleAreaSize: Size | undefined;
}
