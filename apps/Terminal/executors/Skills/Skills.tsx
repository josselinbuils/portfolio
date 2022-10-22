import React from 'react';
import type { Executor } from '../Executor';
import styles from './Skills.module.scss';

export const Skills: Executor = () => (
  <p className={styles.skills}>
    <span className={styles.orange}>let</span>
    <span> skills = [</span>
    <span className={styles.green}>&apos;JavaScript&apos;</span>
    <span className={styles.orange}>, </span>
    <span className={styles.green}>&apos;TypeScript&apos;</span>
    <span className={styles.orange}>, </span>
    <span className={styles.green}>&apos;React&apos;</span>
    <span className={styles.orange}>, </span>
    <span className={styles.green}>&apos;Node.js&apos;</span>
    <span className={styles.orange}>, </span>
    <span className={styles.green}>&apos;Git&apos;</span>
    <span className={styles.orange}>, </span>
    <span className={styles.green}>&apos;Docker&apos;</span>
    <span>]</span>
    <span className={styles.orange}>;</span>
  </p>
);
