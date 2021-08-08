import { FC, useRef, useState } from 'react';
import { Tooltip } from '../../components/Tooltip/Tooltip';
import { TooltipDescriptor } from '../../components/Tooltip/TooltipDescriptor';
import { TooltipContext } from './TooltipContext';

const TOOLTIP_CLOSE_DELAY_MS = 50;
const TOOLTIP_OPEN_DELAY_MS = 500;

export const TooltipProvider: FC = ({ children }) => {
  const [descriptor, setDescriptor] = useState<TooltipDescriptor>();
  const [displayCallback, setDisplayCallback] =
    useState<() => TooltipDescriptor>();
  const [displayed, setDisplayed] = useState<boolean>();
  const closeTimeoutRef = useRef<number>();
  const openTimeoutRef = useRef<number>();

  function onEnterTooltipParent(
    newDescriptor: TooltipDescriptor,
    updateDescriptorOnDisplay?: () => TooltipDescriptor
  ) {
    window.clearTimeout(closeTimeoutRef.current);
    setDescriptor(newDescriptor);

    if (updateDescriptorOnDisplay) {
      if (displayed) {
        setDescriptor(updateDescriptorOnDisplay());
        setDisplayCallback(undefined);
      } else {
        setDisplayCallback(() => updateDescriptorOnDisplay);
      }
    }
  }

  function onLeaveTooltipParent() {
    window.clearTimeout(closeTimeoutRef.current);

    closeTimeoutRef.current = window.setTimeout(() => {
      window.clearTimeout(closeTimeoutRef.current);
      window.clearTimeout(openTimeoutRef.current);

      closeTimeoutRef.current = undefined;
      openTimeoutRef.current = undefined;

      setDescriptor(undefined);
      setDisplayed(false);
    }, TOOLTIP_CLOSE_DELAY_MS);
  }

  function onMoveTooltipParent() {
    window.clearTimeout(openTimeoutRef.current);

    if (!displayed) {
      openTimeoutRef.current = window.setTimeout(() => {
        setDisplayed(true);

        if (displayCallback) {
          setTimeout(() => setDescriptor(displayCallback()), 0);
        }
      }, TOOLTIP_OPEN_DELAY_MS);
    }
  }

  return (
    <TooltipContext.Provider
      value={{
        onEnterTooltipParent,
        onLeaveTooltipParent,
        onMoveTooltipParent,
      }}
    >
      {children}
      {descriptor && displayed && <Tooltip {...descriptor} />}
    </TooltipContext.Provider>
  );
};
