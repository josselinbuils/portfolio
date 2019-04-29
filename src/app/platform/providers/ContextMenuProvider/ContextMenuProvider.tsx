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
import { decorateHandler } from '~/platform/utils';

export const ContextMenuProvider: FC = ({ children }) => {
  const [descriptor, setDescriptor] = useState<ContextMenuDescriptor>();

  const child = Children.only(children) as ReactElement;
  const hide = () => setDescriptor(undefined);

  return (
    <ContextMenuContext.Provider value={setDescriptor}>
      {cloneElement(child, {
        onMouseDown: decorateHandler(hide, child.props.onMouseDown)
      })}
      {descriptor && <ContextMenu {...descriptor} onHide={hide} />}
    </ContextMenuContext.Provider>
  );
};
