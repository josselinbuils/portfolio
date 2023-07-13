import { type FC, type JSX, type PropsWithChildren } from 'preact/compat';
import { Children, cloneElement } from 'preact/compat';
import { type ContextMenuDescriptor } from './ContextMenuDescriptor';
import { useContextMenu } from './useContextMenu';

export const WithContextMenu: FC<PropsWithChildren<Props>> = ({
  children,
  descriptor,
}) => {
  const { showContextMenu } = useContextMenu();
  const child = Children.only(children) as JSX.Element;

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
