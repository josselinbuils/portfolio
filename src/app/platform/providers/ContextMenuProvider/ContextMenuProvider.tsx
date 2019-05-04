import React, { FC, useState } from 'react';
import {
  ContextMenu,
  ContextMenuDescriptor
} from '~/platform/components/ContextMenu';
import { ContextMenuContext } from './ContextMenuContext';
import styles from './ContextMenuProvider.module.scss';

export const ContextMenuProvider: FC = ({ children }) => {
  const [descriptor, setDescriptor] = useState<ContextMenuDescriptor>();
  const hide = () => setDescriptor(undefined);

  return (
    <ContextMenuContext.Provider value={setDescriptor}>
      <div
        className={descriptor && styles.overlay}
        onMouseDown={descriptor && hide}
      >
        <div className={descriptor && styles.eventLess}>{children}</div>
      </div>
      {descriptor && <ContextMenu {...descriptor} onHide={hide} />}
    </ContextMenuContext.Provider>
  );
};
