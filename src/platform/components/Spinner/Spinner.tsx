import { type FunctionComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import styles from './Spinner.module.css';

const DISPLAY_DELAY_MS = 100;

export type SpinnerProps = {
  color: string;
};

export const Spinner: FunctionComponent<SpinnerProps> = ({ color }) => {
  const [isDisplayed, setIsDisplayed] = useState(false);
  const style = { backgroundColor: color };

  useEffect(() => {
    const timeoutId = window.setTimeout(
      () => setIsDisplayed(true),
      DISPLAY_DELAY_MS,
    );
    return () => window.clearTimeout(timeoutId);
  }, []);

  return isDisplayed ? (
    <div className={styles.spinner}>
      <div className={styles.doubleBounce1} style={style} />
      <div className={styles.doubleBounce2} style={style} />
    </div>
  ) : null;
};
