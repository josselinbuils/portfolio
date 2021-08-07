import {
  Children,
  cloneElement,
  FC,
  ReactElement,
  useContext,
  useState,
} from 'react';
import { TooltipDescriptor } from '~/platform/components/Tooltip/TooltipDescriptor';
import { TooltipContext } from './TooltipContext';

const TOOLTIP_DELAY_MS = 500;

export const WithTooltip: FC<TooltipDescriptor> = ({
  children,
  ...descriptor
}) => {
  const [fullDescriptor, setFullDescriptor] = useState<TooltipDescriptor>();
  const [timeoutID, setTimeoutID] = useState<number>();
  const setTooltipDescriptor = useContext(TooltipContext);
  const child = Children.only(children) as ReactElement;

  function close(): void {
    window.clearTimeout(timeoutID);
    setFullDescriptor(undefined);
    setTimeoutID(undefined);
    setTooltipDescriptor(undefined);
  }

  return cloneElement(child, {
    onClick: (event: MouseEvent) => {
      close();
      child.props.onClick(event);
    },
    onMouseEnter: (event: MouseEvent) => {
      const target = event.currentTarget as HTMLElement;

      if (descriptor.id === undefined) {
        descriptor.id = Date.now().toString();
      }

      if (descriptor.position === undefined) {
        const { right: x, y, height } = target.getBoundingClientRect();
        descriptor.position = { x, y: Math.round(y + height / 2) };
      }

      descriptor.style = {
        transformOrigin: 'left',
        transition: 'transform 0.1s ease-out',
        ...descriptor.style,
        transform: `${descriptor.style?.transform || ''} translateY(-50%)`,
      };

      setFullDescriptor(descriptor);

      setTooltipDescriptor({
        ...descriptor,
        style: {
          ...descriptor.style,
          transform: `${descriptor.style.transform} scaleX(0)`,
        },
      });
    },
    onMouseLeave: close,
    onMouseMove: () => {
      if (timeoutID !== undefined) {
        clearTimeout(timeoutID);
      }
      setTimeoutID(
        window.setTimeout(
          () => setTooltipDescriptor(fullDescriptor),
          TOOLTIP_DELAY_MS
        )
      );
    },
  });
};
