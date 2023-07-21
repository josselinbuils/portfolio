import { type FC } from 'preact/compat';
import { useEffect, useState } from 'preact/compat';
import { type Size } from '@/platform/interfaces/Size';
import { type WindowInstance } from '@/platform/services/windowManager/WindowInstance';
import { windowManager } from '@/platform/services/windowManager/windowManager';

export const Windows: FC<Props> = ({ visibleAreaSize }) => {
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
            onClose={windowManager.closeWindow}
            onMinimise={windowManager.hideWindow}
            onSelect={windowManager.selectWindow}
            onUnselect={windowManager.unselectWindow}
            visibleAreaSize={visibleAreaSize}
            {...forwardedProps}
            key={id}
          />
        ),
      )}
    </>
  );
};

interface Props {
  visibleAreaSize: Size | undefined;
}
