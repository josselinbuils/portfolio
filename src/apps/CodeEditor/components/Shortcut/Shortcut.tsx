import { type FC, type JSX } from 'preact/compat';
import styles from './Shortcut.module.scss';

export interface ShortcutProps {
  keys: string[];
}

export const Shortcut: FC<ShortcutProps> = ({ keys }) => (
  <>
    {keys
      .map<JSX.Element>((key) => (
        <kbd className={styles.key} key={key}>
          {key}
        </kbd>
      ))
      .reduce(
        (prev, curr, index) =>
          [
            prev,
            // eslint-disable-next-line react/no-array-index-key
            <span className={styles.plus} key={`plus-${index}`}>
              +
            </span>,
            curr,
          ] as any,
      )}
  </>
);
