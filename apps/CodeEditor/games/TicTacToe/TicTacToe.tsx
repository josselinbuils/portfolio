import type { FC } from 'react';
import React, { useEffect, useMemo, useState } from 'react';
import type { Position } from '~/platform/interfaces/Position';
import styles from './TicTacToe.module.scss';
import { Cross, Grid, Round } from './components/Elements/Elements';
import type { Elements } from './utils/GameManager';
import { GameManager } from './utils/GameManager';

export const TicTacToe: FC = () => {
  const gameManager = useMemo(() => new GameManager(), []);
  const [elements, setElements] = useState<Elements>();
  const [winnerCases, setWinnerCases] = useState<Position[] | undefined>();

  useEffect(() => {
    gameManager.onStart(() => setWinnerCases(undefined));

    gameManager.onEnd((winner) => {
      if (winner) {
        console.log(`The winner is ${winner.element} ヽ(^o^)ノ`);
        setWinnerCases(winner.cases);
      } else {
        console.log(`There is no winner【ツ】`);
      }
    });

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
              return (
                <Cross
                  highlighted={isCaseHighlighted(winnerCases, { x, y })}
                  // eslint-disable-next-line react/no-array-index-key
                  key={`${x}${y}`}
                  position={{ x, y }}
                />
              );
            case 'o':
              return (
                <Round
                  highlighted={isCaseHighlighted(winnerCases, { x, y })}
                  // eslint-disable-next-line react/no-array-index-key
                  key={`${x}${y}`}
                  position={{ x, y }}
                />
              );
            default:
              return null;
          }
        })
      )}
    </div>
  );
};

function isCaseHighlighted(
  winnerCases: Position[] | undefined,
  { x, y }: Position
): boolean {
  return (
    winnerCases?.some((position) => position.x === x && position.y === y) ??
    false
  );
}
