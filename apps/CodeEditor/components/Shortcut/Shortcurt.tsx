import React, { FC, ReactNode } from 'react';

import styles from './Shortcut.module.scss';

export const Shortcut: FC<Props> = ({ keys }) => (
  <>
    {keys
      .map<ReactNode>((key) => (
        <kbd className={styles.key} key={key}>
          {key}
        </kbd>
      ))
      .reduce((prev, curr) => [prev, '+', curr])}
  </>
);

interface Props {
  keys: string[];
}
