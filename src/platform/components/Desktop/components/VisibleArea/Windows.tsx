import { type FC, useEffect, useState } from 'preact/compat';
import { type Size } from '@/platform/interfaces/Size';
import { type WindowInstance } from '@/platform/services/windowManager/WindowInstance';
import { windowManager } from '@/platform/services/windowManager/windowManager';

export interface WindowsProps {
  visibleAreaSize: Size | undefined;
}

export const Windows: FC<WindowsProps> = ({ visibleAreaSize }) => {
  const [windowInstances, setWindowInstances] = useState<WindowInstance[]>(() =>
    windowManager.getWindowInstances(),
  );

  useEffect(
    () => windowManager.windowInstancesSubject.subscribe(setWindowInstances),
    [],
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
