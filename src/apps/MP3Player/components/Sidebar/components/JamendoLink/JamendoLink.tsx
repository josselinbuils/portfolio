import { type FunctionComponent } from 'preact';

import classes from './JamendoLink.module.css';

export const JamendoLink: FunctionComponent = () => (
  <a
    className={classes.jamendoLink}
    href="https://www.jamendo.com"
    rel="noopener noreferrer"
    target="_blank"
  >
    powered by jamendo
  </a>
);
