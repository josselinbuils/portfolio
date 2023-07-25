import { type FC, type JSX, type PropsWithChildren } from 'preact/compat';
import { Children, cloneElement } from 'preact/compat';
import { type MenuDescriptor } from './MenuDescriptor';
import { useMenu } from './useMenu';

export const WithMenu: FC<PropsWithChildren<Props>> = ({
  children,
  descriptor,
}) => {
  const { showMenu } = useMenu();
  const child = Children.only(children) as JSX.Element;

  const onMenu = (event: MouseEvent) => {
    const { clientX, clientY } = event;
    const { position, ...rest } =
      typeof descriptor === 'function' ? descriptor() : descriptor;

    event.preventDefault();

    showMenu({
      position: position || { x: clientX, y: clientY },
      ...rest,
    });
  };

  return cloneElement(child, { onMenu });
};

interface Props {
  descriptor: MenuDescriptor | (() => MenuDescriptor);
}
