import { type FC, type PropsWithChildren, Suspense } from 'preact/compat';
import { useCallback, useMemo, useRef, useState } from 'preact/compat';
import { lazy } from '@/platform/utils/lazy';
import { type TooltipDescriptor } from '../../components/Tooltip/TooltipDescriptor';
import { TooltipContext } from './TooltipContext';

const Tooltip = lazy(
  async () => (await import('../../components/Tooltip/Tooltip')).Tooltip,
);

const TOOLTIP_CLOSE_DELAY_MS = 50;
const TOOLTIP_OPEN_DELAY_MS = 500;

export const TooltipProvider: FC<PropsWithChildren<unknown>> = ({
  children,
}) => {
  const [descriptor, setDescriptor] = useState<TooltipDescriptor>();
  const [displayCallback, setDisplayCallback] =
    useState<() => TooltipDescriptor>();
  const [displayed, setDisplayed] = useState<boolean>();
  const closeTimeoutRef = useRef<number>();
  const openTimeoutRef = useRef<number>();

  const onTooltipDOMReady = useCallback(() => {
    if (displayCallback) {
      setTimeout(() => setDescriptor(displayCallback()), 0);
    }
  }, [displayCallback]);

  const value = useMemo(() => {
    function onEnterTooltipParent(
      newDescriptor: TooltipDescriptor,
      updateDescriptorOnDisplay?: () => TooltipDescriptor,
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
        }, TOOLTIP_OPEN_DELAY_MS);
      }
    }

    return {
      onEnterTooltipParent,
      onLeaveTooltipParent,
      onMoveTooltipParent,
    };
  }, [displayed]);

  return (
    <TooltipContext.Provider value={value}>
      {children}
      {descriptor && displayed && (
        <Suspense fallback={null}>
          <Tooltip {...descriptor} onDOMReady={onTooltipDOMReady} />
        </Suspense>
      )}
    </TooltipContext.Provider>
  );
};
