import cn from 'classnames';
import React from 'react';
import { Window } from '~/platform/components/Window';
import { WindowComponent } from '~/platform/providers/WindowProvider';
import styles from './Teravia.module.scss';

export const Teravia: WindowComponent = ({ active, ...rest }) => {
  return (
    <Window
      {...rest}
      active={active}
      background="#1a1d1e"
      titleColor="#2b5158"
      maxHeight={791}
      maxWidth={1367}
      minHeight={472}
      minWidth={800}
      title={Teravia.appName}
    >
      <iframe
        allow="fullscreen"
        className={cn(styles.iframe, { [styles.inactive]: !active })}
        height="100%"
        src="https://josselinbuils.me/teravia"
        title={Teravia.appName}
        width="100%"
      />
    </Window>
  );
};

Teravia.appName = 'Teravia';
Teravia.iconClass = 'fas fa-gamepad';
