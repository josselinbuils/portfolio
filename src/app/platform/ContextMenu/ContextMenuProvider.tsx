import React, { FC, useState } from 'react';

import { ContextMenu } from './ContextMenu';
import { ContextMenuDescriptor } from './ContextMenuDescriptor';

// noinspection JSUnusedLocalSymbols
const ContextMenuContext = React.createContext(
  (descriptor: ContextMenuDescriptor) => {},
);

export const ContextMenuConsumer = ContextMenuContext.Consumer;

export const ContextMenuProvider: FC = ({ children }) => {
  const [descriptor, setDescriptor] = useState<ContextMenuDescriptor>();

  return (
    <ContextMenuContext.Provider value={setDescriptor}>
      {children}
      {descriptor && (
        <ContextMenu {...descriptor} onHide={setDescriptor as () => void} />
      )}
    </ContextMenuContext.Provider>
  );
};
