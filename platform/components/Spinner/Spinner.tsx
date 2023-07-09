import { type FC } from 'react';
import { useEffect, useState } from 'react';
import styles from './Spinner.module.scss';

const DISPLAY_DELAY_MS = 100;

export const Spinner: FC<Props> = ({ color }) => {
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

interface Props {
  color: string;
}
