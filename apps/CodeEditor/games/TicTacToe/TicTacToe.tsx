import React, { FC, useEffect, useMemo, useState } from 'react';
import { Cross, Grid, Round } from './components/Elements/Elements';
import { Elements, GameManager } from './utils/GameManager';

import styles from './TicTacToe.module.scss';

export const TicTacToe: FC = () => {
  const gameManager = useMemo(() => new GameManager(), []);
  const [elements, setElements] = useState<Elements>();

  useEffect(() => {
    gameManager.subject.subscribe(setElements);
    (window as any).ticTacToe = gameManager;
    return gameManager.clean;
  }, [gameManager]);

  return (
    <div className={styles.ticTacToe}>
      <Grid />
      {elements?.map((line, y) =>
        line.map((element, x) => {
          switch (element) {
            case 'x':
              // eslint-disable-next-line react/no-array-index-key
              return <Cross key={`${x}${y}`} position={[x, y]} />;
            case 'o':
              // eslint-disable-next-line react/no-array-index-key
              return <Round key={`${x}${y}`} position={[x, y]} />;
            default:
              return null;
          }
        })
      )}
    </div>
  );
};
