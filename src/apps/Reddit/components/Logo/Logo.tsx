import { faRedditAlien } from '@fortawesome/free-brands-svg-icons/faRedditAlien';
import { type FunctionComponent } from 'preact';

import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';

import styles from './Logo.module.css';

export const Logo: FunctionComponent = () => (
  <figure className={styles.logo}>
    <FontAwesomeIcon className={styles.icon} icon={faRedditAlien} />
  </figure>
);
