import cn from 'classnames';
import { type FC, useEffect, useState } from 'preact/compat';
import '../../global.scss';
import styles from './NotFound.module.scss';

export const NotFound: FC = () => {
  const [progress, setProgress] = useState(20);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setProgress((currentProgress) => {
        if (currentProgress === 80) {
          window.clearInterval(interval);
          window.location.href = '/';
        }
        return currentProgress + 20;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  });

  return (
    <main
      className={cn(styles.notFound, { [styles.complete]: progress >= 100 })}
    >
      <h1>:(</h1>
      <h2>The website ran into and problem and needs to restart.</h2>
      <h2>{progress}% complete</h2>
      <p>Stop code: ERROR_404_NOT_FOUND</p>
    </main>
  );
};
