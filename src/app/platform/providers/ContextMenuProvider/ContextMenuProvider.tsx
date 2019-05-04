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
  const child = Children.only(children) as ReactElement;
  const childClassName = cn(
    child.props.className,
    descriptor && styles.eventLess
  );

  return (
    <ContextMenuContext.Provider value={setDescriptor}>
      {cloneElement(child, { className: childClassName })}
      {descriptor && (
        <>
          <div className={styles.overlay} onMouseDown={hide} />
          <ContextMenu {...descriptor} onHide={hide} />
        </>
      )}
    </ContextMenuContext.Provider>
  );
};
