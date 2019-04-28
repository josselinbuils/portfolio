import classNames from 'classnames';
import React, { FC, MouseEvent } from 'react';
import './ContextMenuItem.scss';

export const ContextMenuItem: FC<ContextMenuItemDescriptor> = ({
  onClick,
  iconClass,
  title
}) => {
  return (
    <li className="item" key={title} onClick={onClick}>
      <div className="icon">
        {iconClass && <i className={classNames('fas', iconClass)} />}
      </div>
      <div className="title">{title}</div>
    </li>
  );
};

export interface ContextMenuItemDescriptor {
  iconClass?: string;
  title: string;
  onClick(event: MouseEvent): void;
}
