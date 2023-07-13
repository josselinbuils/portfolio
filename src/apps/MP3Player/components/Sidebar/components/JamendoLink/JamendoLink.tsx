import { type FC } from 'preact/compat';
import styles from './JamendoLink.module.scss';

export const JamendoLink: FC = () => (
  <a
    className={styles.jamendoLink}
    href="https://www.jamendo.com"
    rel="noopener noreferrer"
    target="_blank"
  >
    powered by jamendo
  </a>
);
