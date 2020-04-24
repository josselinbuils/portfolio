import { Children, cloneElement, FC, ReactElement } from 'react';
import { ContextMenuDescriptor } from '~/platform/components/ContextMenu';
import { useContextMenu } from './useContextMenu';

export const WithContextMenu: FC<Props> = ({ children, descriptor }) => {
  const { showContextMenu } = useContextMenu();
  const child = Children.only(children) as ReactElement;

  const onContextMenu = (event: MouseEvent) => {
    const { clientX, clientY } = event;
    const { position, ...rest } =
      typeof descriptor === 'function' ? descriptor() : descriptor;

    event.preventDefault();

    showContextMenu({
      position: position || { x: clientX, y: clientY },
      ...rest,
    });
  };

  return cloneElement(child, { onContextMenu });
};

interface Props {
  descriptor: ContextMenuDescriptor | (() => ContextMenuDescriptor);
}
