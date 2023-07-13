import { faRedditAlien } from '@fortawesome/free-brands-svg-icons/faRedditAlien';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { type FC } from 'preact/compat';
import styles from './Logo.module.scss';

export const Logo: FC = () => (
  <figure className={styles.logo}>
    <FontAwesomeIcon className={styles.icon} icon={faRedditAlien} />
  </figure>
);
