import { faGithub } from '@fortawesome/free-brands-svg-icons/faGithub';
import { faLinkedin } from '@fortawesome/free-brands-svg-icons/faLinkedin';
import { faAddressCard } from '@fortawesome/free-solid-svg-icons/faAddressCard';

import { FontAwesomeIcon } from '@/platform/components/FontAwesomeIcon/FontAwesomeIcon';

import { type Executor } from '../Executor';
import classes from './About.module.css';

export const About: Executor = () => (
  <div className={classes.about}>
    <img alt="me" height={269} src="/assets/me.webp" width={202} />
    <div className={classes.info}>
      <p className={classes.resume}>
        Hey, I&apos;m Josselin, a full-stack JavaScript developer :)
      </p>
      <p className={classes.social}>
        <a
          aria-label="LinkedIn account"
          href="https://linkedin.com/in/josselinbuils"
          rel="noopener noreferrer"
          target="_blank"
        >
          <FontAwesomeIcon icon={faLinkedin} />
        </a>
        <a
          aria-label="GitHub account"
          href="https://github.com/josselinbuils"
          rel="noopener noreferrer"
          target="_blank"
        >
          <FontAwesomeIcon icon={faGithub} />
        </a>
        <a aria-label="Curriculum Vitae" href="/assets/cv.pdf" target="_blank">
          <FontAwesomeIcon icon={faAddressCard} />
        </a>
      </p>
      <p className={classes.help}>Type help for more information</p>
    </div>
  </div>
);
