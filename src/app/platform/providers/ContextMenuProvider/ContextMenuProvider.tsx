import React, {
  Children,
  cloneElement,
  FC,
  ReactElement,
  useState
} from 'react';
import { ContextMenu, ContextMenuDescriptor } from './ContextMenu';
import { ContextMenuContext } from './ContextMenuContext';

export const ContextMenuProvider: FC = ({ children }) => {
  const [descriptor, setDescriptor] = useState<ContextMenuDescriptor>();

  const child = Children.only(children) as ReactElement;
  const hide = () => setDescriptor(undefined);

  return (
    <ContextMenuContext.Provider value={setDescriptor}>
      {cloneElement(child, { onMouseDown: hide })}
      {descriptor && <ContextMenu {...descriptor} onHide={hide} />}
    </ContextMenuContext.Provider>
  );
};
