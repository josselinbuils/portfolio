import { type FunctionComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import classes from './Spinner.module.css';

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
    <div className={classes.spinner}>
      <div className={classes.doubleBounce1} style={style} />
      <div className={classes.doubleBounce2} style={style} />
    </div>
  ) : null;
};
