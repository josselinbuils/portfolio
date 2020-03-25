import React, { Children, cloneElement, FC, ReactElement } from 'react';
import { ContextMenuDescriptor } from '~/platform/components/ContextMenu';
import {
  ContextMenuContext,
  ContextMenuDescriptorSetter,
} from './ContextMenuContext';

export const WithContextMenu: FC<Props> = ({ children, descriptor }) => {
  const child = Children.only(children) as ReactElement;

  const contextMenuHandlerFactory = (showMenu: ContextMenuDescriptorSetter) => (
    event: MouseEvent
  ) => {
    const { clientX, clientY } = event;
    const { position, ...rest } =
      typeof descriptor === 'function' ? descriptor() : descriptor;

    event.preventDefault();

    showMenu({
      position: position || { x: clientX, y: clientY },
      ...rest,
    });
  };

  return (
    <ContextMenuContext.Consumer>
      {(showMenu) =>
        cloneElement(child, {
          onContextMenu: contextMenuHandlerFactory(showMenu),
        })
      }
    </ContextMenuContext.Consumer>
  );
};

interface Props {
  descriptor: ContextMenuDescriptor | (() => ContextMenuDescriptor);
}
