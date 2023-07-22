import { faRedditAlien } from '@fortawesome/free-brands-svg-icons/faRedditAlien';
import { type FC } from 'preact/compat';
import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';
import styles from './Logo.module.scss';

export const Logo: FC = () => (
  <figure className={styles.logo}>
    <FontAwesomeIcon className={styles.icon} icon={faRedditAlien} />
  </figure>
);
