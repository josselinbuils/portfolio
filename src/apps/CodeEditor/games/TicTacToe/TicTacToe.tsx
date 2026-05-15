import { type FunctionComponent } from 'preact';
import { useEffect, useState } from 'preact/hooks';

import { type Position } from '@/platform/interfaces/Position';

import { Cross } from './components/Cross';
import { Grid } from './components/Grid';
import { Round } from './components/Round';
import classes from './TicTacToe.module.css';
import { GameManager, type Grid as GridType } from './utils/GameManager';

export const TicTacToe: FunctionComponent = () => {
  const [grid, setGrid] = useState<GridType>();
  const [winnerCases, setWinnerCases] = useState<Position[] | undefined>();

  useEffect(() => {
    const gameManager = new GameManager();

    gameManager.onEnd((winner) => {
      if (winner) {
        setWinnerCases(winner.cases);
      }
    });

    gameManager.subject.subscribe((newGrid) => {
      setWinnerCases(undefined);
      setGrid(newGrid);
    });

    (window as any).ticTacToe = gameManager;

    return gameManager.clean;
  }, []);

  return (
    <div className={classes.ticTacToe}>
      <Grid>
        {grid?.map((row, y) =>
          row.map((mark, x) => {
            switch (mark) {
              case 'o':
                return (
                  <Round
                    highlighted={isCaseHighlighted(winnerCases, { x, y })}
                    key={`${x}${y}`}
                    position={{ x, y }}
                  />
                );
              case 'x':
                return (
                  <Cross
                    highlighted={isCaseHighlighted(winnerCases, { x, y })}
                    key={`${x}${y}`}
                    position={{ x, y }}
                  />
                );
              default:
                return null;
            }
          }),
        )}
      </Grid>
    </div>
  );
};

function isCaseHighlighted(
  winnerCases: Position[] | undefined,
  { x, y }: Position,
): boolean {
  return (
    winnerCases?.some((position) => position.x === x && position.y === y) ??
    false
  );
}
