import React, { FC } from 'react';

import styles from './Spinner.module.scss';

export const Spinner: FC<Props> = ({ color }) => {
  const style = { backgroundColor: color };

  return (
    <div className={styles.spinner}>
      <div className={styles.doubleBounce1} style={style} />
      <div className={styles.doubleBounce2} style={style} />
    </div>
  );
};

interface Props {
  color: string;
}
