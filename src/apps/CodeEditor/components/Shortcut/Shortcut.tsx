import { type FunctionComponent, type JSX } from 'preact';

import { makeKeysHumanReadable, normaliseKeys } from '@/platform/utils/keys';

import styles from './Shortcut.module.scss';

export type ShortcutProps = {
  keys: string[];
};

export const Shortcut: FunctionComponent<ShortcutProps> = ({ keys }) => (
  <>
    {keys
      .map<JSX.Element>((key) => (
        <kbd className={styles.key} key={key}>
          {makeKeysHumanReadable(normaliseKeys(key))}
        </kbd>
      ))
      .reduce(
        (prev, curr, index) =>
          [
            prev,

            <span className={styles.plus} key={`plus-${index}`}>
              +
            </span>,
            curr,
          ] as any,
      )}
  </>
);
