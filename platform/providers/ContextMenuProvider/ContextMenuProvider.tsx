import cn from 'classnames';
import dynamic from 'next/dynamic';
import { type FC, type PropsWithChildren, type ReactElement } from 'react';
import { Children, cloneElement, useCallback, useMemo, useState } from 'react';
import { ContextMenuContext } from './ContextMenuContext';
import { type ContextMenuDescriptor } from './ContextMenuDescriptor';
import styles from './ContextMenuProvider.module.scss';

const ContextMenu = dynamic(
  async () => (await import('./ContextMenu/ContextMenu')).ContextMenu,
);

export const ContextMenuProvider: FC<PropsWithChildren<unknown>> = ({
  children,
}) => {
  const [descriptor, setDescriptor] = useState<ContextMenuDescriptor>();
  const hideContextMenu = useCallback(() => setDescriptor(undefined), []);

  const value = useMemo(
    () => ({
      hideContextMenu,
      isContextMenuDisplayed: descriptor !== undefined,
      showContextMenu: setDescriptor,
    }),
    [descriptor, hideContextMenu],
  );

  return (
    <ContextMenuContext.Provider value={value}>
      {Children.map(children as ReactElement[], (child) =>
        cloneElement(child, {
          className: cn(child.props.className, {
            [styles.eventLess]: descriptor,
          }),
        }),
      )}
      {descriptor && (
        <>
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
          <div className={styles.overlay} onMouseDown={hideContextMenu} />
          <ContextMenu {...descriptor} onHide={hideContextMenu} />
        </>
      )}
    </ContextMenuContext.Provider>
  );
};
