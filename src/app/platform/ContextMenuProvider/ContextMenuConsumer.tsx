import React, { FC, ReactElement } from 'react';

import { ContextMenuDescriptor } from './ContextMenu';
import {
  ContextMenuContext,
  ContextMenuDescriptorSetter,
} from './ContextMenuContext';

export const ContextMenuConsumer: FC<Props> = ({ children, descriptor }) => {
  const child = React.Children.only(children) as ReactElement;

  const contextMenuHandlerFactory = (showMenu: ContextMenuDescriptorSetter) => (
    event: MouseEvent,
  ) => {
    const { clientX, clientY } = event;
    const { position, ...rest } = descriptor;

    event.preventDefault();

    showMenu({
      position: position || { left: clientX, top: clientY },
      ...rest,
    });
  };

  return (
    <ContextMenuContext.Consumer>
      {showMenu =>
        React.cloneElement(child, {
          onContextMenu: contextMenuHandlerFactory(showMenu),
        })
      }
    </ContextMenuContext.Consumer>
  );
};

interface Props {
  descriptor: ContextMenuDescriptor;
}
