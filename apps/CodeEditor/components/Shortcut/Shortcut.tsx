import { type FC, type ReactNode } from 'react';
import styles from './Shortcut.module.scss';

export const Shortcut: FC<Props> = ({ keys }) => (
  <>
    {keys
      .map<ReactNode>((key) => (
        <kbd className={styles.key} key={key}>
          {key}
        </kbd>
      ))
      .reduce((prev, curr, index) => [
        prev,
        // eslint-disable-next-line react/no-array-index-key
        <span className={styles.plus} key={`plus-${index}`}>
          +
        </span>,
        curr,
      ])}
  </>
);

interface Props {
  keys: string[];
}
