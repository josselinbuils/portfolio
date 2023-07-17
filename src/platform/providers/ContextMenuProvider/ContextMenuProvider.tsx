import cn from 'classnames';
import {
  type FC,
  type JSX,
  type PropsWithChildren,
  Suspense,
} from 'preact/compat';
import {
  Children,
  cloneElement,
  useCallback,
  useMemo,
  useState,
} from 'preact/compat';
import { lazy } from '@/platform/utils/lazy';
import { ContextMenuContext } from './ContextMenuContext';
import { type ContextMenuDescriptor } from './ContextMenuDescriptor';
import styles from './ContextMenuProvider.module.scss';

const ContextMenu = lazy(
  async () => (await import('./ContextMenu/ContextMenu')).ContextMenu,
);

export const ContextMenuProvider: FC<PropsWithChildren> = ({ children }) => {
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
      {Children.map(children as JSX.Element[], (child) =>
        cloneElement(child, {
          className: cn(child.props.className, {
            [styles.eventLess]: descriptor,
          }),
        }),
      )}
      {descriptor && (
        <Suspense fallback={null}>
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
          <div className={styles.overlay} onMouseDown={hideContextMenu} />
          <ContextMenu {...descriptor} onHide={hideContextMenu} />
        </Suspense>
      )}
    </ContextMenuContext.Provider>
  );
};
