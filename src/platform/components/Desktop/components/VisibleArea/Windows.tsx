import { type FunctionComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { type Size } from '@/platform/interfaces/Size';
import { type WindowInstance } from '@/platform/services/windowManager/WindowInstance';
import { windowManager } from '@/platform/services/windowManager/windowManager';

export type WindowsProps = {
  visibleAreaSize: Size | undefined;
};

export const Windows: FunctionComponent<WindowsProps> = ({
  visibleAreaSize,
}) => {
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
            id={id}
            key={id}
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
