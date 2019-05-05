import React from 'react';
import { Executor } from '../Executor';
import styles from './Skills.module.scss';

export const Skills: Executor = () => (
  <p className={styles.skills}>
    <span className={styles.orange}>let</span>
    <span> skills = [</span>
    <span className={styles.green}>'JavaScript'</span>
    <span className={styles.orange}>, </span>
    <span className={styles.green}>'Web Applications'</span>
    <span className={styles.orange}>, </span>
    <span className={styles.green}>'TypeScript'</span>
    <span className={styles.orange}>, </span>
    <span className={styles.green}>'Node.js'</span>
    <span className={styles.orange}>, </span>
    <span className={styles.green}>'Git'</span>
    <span className={styles.orange}>, </span>
    <span className={styles.green}>'Docker'</span>
    <span>]</span>
    <span className={styles.orange}>;</span>
  </p>
);
