import React from 'react';
import { Executor } from '../executor';
import styles from './Work.module.scss';

export const Work: Executor = () => (
  <>
    <div className={styles.entry}>
      <p className={styles.header}>
        <span>Software Engineer Intern at GE Healthcare</span>
        <span className={styles.location}>(Buc, France)</span>
        <span className={styles.period}>mar 2015 -> sept 2015</span>
      </p>
      <p className={styles.description}>
        I implemented an innovative HMI using a web-based architecture to
        optimize the ergonomics of an interventional X-Ray imaging system by
        incorporating the ability to interact with other related medical
        devices.
      </p>
    </div>
    <div className={styles.entry}>
      <p className={styles.header}>
        <span>Software Engineer at GE Healthcare</span>
        <span className={styles.location}>(Buc, France)</span>
        <span className={styles.period}>oct 2015 -> nov 2018</span>
      </p>
      <p className={styles.description}>
        I worked on the frontend part of an SDK that aims to facilitate the
        creation of applications to visualize medical images.
      </p>
    </div>
    <div className={styles.entry}>
      <p className={styles.header}>
        <span>Frontend developer at ManoMano</span>
        <span className={styles.location}>(Paris, France)</span>
        <span className={styles.period}>dec 2018 -> now</span>
      </p>
      <p className={styles.description}>I work on the ManoMano website.</p>
    </div>
  </>
);
