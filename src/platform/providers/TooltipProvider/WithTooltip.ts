import {
  Children,
  cloneElement,
  type FC,
  type PropsWithChildren,
  type ReactElement,
  useContext,
} from 'react';
import { type TooltipDescriptor } from '../../components/Tooltip/TooltipDescriptor';
import { TooltipContext } from './TooltipContext';

export const WithTooltip: FC<PropsWithChildren<TooltipDescriptor>> = ({
  children,
  ...baseDescriptor
}) => {
  const { onEnterTooltipParent, onLeaveTooltipParent, onMoveTooltipParent } =
    useContext(TooltipContext);
  const child = Children.only(children) as ReactElement;

  return cloneElement(child, {
    onClick: (event: MouseEvent) => {
      onLeaveTooltipParent();
      child.props.onClick(event);
    },
    onMouseEnter: (event: MouseEvent) => {
      const target = event.currentTarget as HTMLElement;
      const descriptor = { ...baseDescriptor };

      if (descriptor.position === undefined) {
        const { right: x, y, height } = target.getBoundingClientRect();
        descriptor.position = { x, y: Math.round(y + height / 2) };
      }

      descriptor.style = {
        transformOrigin: 'left',
        transition: 'transform 0.1s ease-out',
        ...descriptor.style,
        transform: `${
          descriptor.style?.transform || ''
        } translateY(-50%) scaleX(0)`,
      };

      onEnterTooltipParent(descriptor, () => ({
        ...descriptor,
        style: {
          ...descriptor.style,
          transform: descriptor.style?.transform?.replace(' scaleX(0)', ''),
        },
      }));
    },
    onMouseLeave: onLeaveTooltipParent,
    onMouseMove: onMoveTooltipParent,
  });
};
