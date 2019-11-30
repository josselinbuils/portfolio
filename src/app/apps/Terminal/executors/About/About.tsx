import React from 'react';
import { Executor } from '../Executor';
import styles from './About.module.scss';
import photo from './josselinbuils.png';

const socialLinks = [
  ['linkedin', 'https://linkedin.com/in/josselinbuils'],
  ['github', 'https://github.com/josselinbuils'],
  ['twitter', 'https://twitter.com/josselinbuils']
];

export const About: Executor = () => (
  <div className={styles.about}>
    <img className={styles.photo} src={photo} alt="me" />
    <div className={styles.info}>
      <p className={styles.resume}>
        Hey, I'm Josselin, a full-stack JavaScript developer :)
      </p>
      <p className={styles.social}>
        {socialLinks.map(([icon, link]) => (
          <a href={link} key={icon} rel="noopener noreferrer" target="_blank">
            <i className={`fab fa-${icon}`} />
          </a>
        ))}
      </p>
      <p className={styles.help}>Type help for more information</p>
    </div>
  </div>
);
