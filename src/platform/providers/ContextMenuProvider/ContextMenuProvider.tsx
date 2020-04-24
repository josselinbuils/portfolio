import cn from 'classnames';
import React, {
  Children,
  cloneElement,
  FC,
  ReactElement,
  useCallback,
  useState,
} from 'react';
import {
  ContextMenu,
  ContextMenuDescriptor,
} from '~/platform/components/ContextMenu';
import { ContextMenuContext } from './ContextMenuContext';

import styles from './ContextMenuProvider.module.scss';

export const ContextMenuProvider: FC = ({ children }) => {
  const [descriptor, setDescriptor] = useState<ContextMenuDescriptor>();
  const hideContextMenu = useCallback(() => setDescriptor(undefined), []);
  const isContextMenuDisplayed = descriptor !== undefined;
  const showContextMenu = setDescriptor;

  return (
    <ContextMenuContext.Provider
      value={{ hideContextMenu, isContextMenuDisplayed, showContextMenu }}
    >
      {Children.map(children as ReactElement[], (child) =>
        cloneElement(child, {
          className: cn(child.props.className, {
            [styles.eventLess]: descriptor,
          }),
        })
      )}
      {descriptor && (
        <>
          <div className={styles.overlay} onMouseDown={hideContextMenu} />
          <ContextMenu {...descriptor} onHide={hideContextMenu} />
        </>
      )}
    </ContextMenuContext.Provider>
  );
};
