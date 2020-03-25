import cn from 'classnames';
import React, {
  Children,
  cloneElement,
  FC,
  ReactElement,
  useState
} from 'react';
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
      {Children.map(children as ReactElement[], child =>
        cloneElement(child, {
          className: cn(child.props.className, {
            [styles.eventLess]: descriptor
          })
        })
      )}
      {descriptor && (
        <>
          <div className={styles.overlay} onMouseDown={hide} />
          <ContextMenu {...descriptor} onHide={hide} />
        </>
      )}
    </ContextMenuContext.Provider>
  );
};
