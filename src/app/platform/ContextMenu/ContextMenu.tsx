import classNames from 'classnames';
import React, { FC } from 'react';

import './ContextMenu.scss';
import { ContextMenuDescriptor } from './ContextMenuDescriptor';

export const ContextMenu: FC<Props> = ({
  items,
  onHide,
  position: { left, top },
  style,
}) => {
  const clickHandler = (click: () => void) => {
    click();
    onHide();
  };

  return (
    <ul className="context-menu" style={{ ...style, left, top }}>
      {items.map(({ click, iconClass, title }) => (
        <li className="item" key={title} onClick={() => clickHandler(click)}>
          <div className="icon">
            {iconClass && <i className={classNames('fas', iconClass)} />}
          </div>
          <div className="title">{title}</div>
        </li>
      ))}
    </ul>
  );
};

interface Props extends ContextMenuDescriptor {
  onHide(): void;
}
