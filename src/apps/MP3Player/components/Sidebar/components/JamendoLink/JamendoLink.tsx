import { type FunctionComponent } from 'preact';

import styles from './JamendoLink.module.scss';

export const JamendoLink: FunctionComponent = () => (
  <a
    className={styles.jamendoLink}
    href="https://www.jamendo.com"
    rel="noopener noreferrer"
    target="_blank"
  >
    powered by jamendo
  </a>
);
