import React from 'react';
import { Executor } from '../executor';
import styles from './About.module.scss';
import photo from './josselinbuils.png';

export const About: Executor = () => (
  <div className={styles.about}>
    <img src={photo} alt="me" />
    <div className={styles.info}>
      <p className={styles.resume}>
        Hey, I'm Josselin, a full-stack JavaScript developer :)
      </p>
      <p className={styles.social}>
        <a
          href="https://linkedin.com/in/josselinbuils"
          rel="noopener noreferrer"
          target="_blank"
        >
          <i className="fab fa-linkedin" />
        </a>
        <a
          href="https://github.com/josselinbuils"
          rel="noopener noreferrer"
          target="_blank"
        >
          <i className="fab fa-github" />
        </a>
        <a href="mailto://contact@josselinbuils.me">
          <i className="fas fa-envelope" />
        </a>
      </p>
      <p className={styles.help}>Type help for more information</p>
    </div>
  </div>
);
