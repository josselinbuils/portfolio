import { Subject } from '@josselinbuils/utils/Subject';
import type { Position } from '~/platform/interfaces/Position';
import type { Action } from '~/platform/state/interfaces/Action';
import type { ActionFromFactory } from '~/platform/state/interfaces/ActionFactory';
import { dispatchToServer, registerClient } from '../../../utils/shareState';
import * as clientActions from './clientActions';
import * as serverActions from './serverActions';

export type Mark = 'x' | 'o' | '';

export type Grid = [[Mark, Mark, Mark], [Mark, Mark, Mark], [Mark, Mark, Mark]];

export const getInitialGrid = (): Grid => [
  ['', '', ''],
  ['', '', ''],
  ['', '', ''],
];

const DELAY_MS = 1000;

export interface Winner {
  cases: Position[];
  mark: Mark;
}

export class GameManager {
  readonly subject: Subject<Grid>;
  private endCallback?: (winner: Winner | undefined) => unknown;
  private grid: Grid;
  private startCallback?: () => unknown;
  private turnCallback?: (grid: Grid) => unknown;
  private readonly unregisterWSClient: () => void;
  private timer?: number;
  private turn?: Mark;

  constructor() {
    this.grid = getInitialGrid();
    this.subject = new Subject(this.grid);
    this.unregisterWSClient = registerClient(this.reduce);
    dispatchToServer(serverActions.subscribe.create());
  }

  onEnd = (callback: (winner: Winner | undefined) => unknown): void => {
    this.endCallback = callback;
  };

  onMyTurn = (callback: (grid: Grid) => unknown): void => {
    this.turnCallback = callback;
  };

  onStart = (callback: () => unknown): void => {
    this.startCallback = callback;
  };

  placeMyMark = (x: number, y: number) => {
    if (this.turn !== 'o') {
      console.error(new Error('This is not your turn!'));
      this.clean();
    } else {
      this.play('o', y, x);
    }
  };

  clean = () => {
    window.clearTimeout(this.timer);
    this.unregisterWSClient();
  };

  start = (): void => {
    window.clearTimeout(this.timer);
    this.grid = getInitialGrid();
    this.subject.next(this.grid);
    this.startCallback?.();
    this.next();
    dispatchToServer(serverActions.reset.create());
  };

  private checkWinner(noWinnerCallback?: () => unknown): void {
    const winner = this.getWinner();

    if (!winner && !this.isFinished()) {
      noWinnerCallback?.();
    } else {
      this.endCallback?.(winner);
    }
  }

  private next = (): void => {
    if (this.turn === undefined) {
      this.turn = Math.random() < 0.5 ? 'o' : 'x';
    } else {
      this.turn = this.turn === 'o' ? 'x' : 'o';
    }

    this.timer = window.setTimeout(() => {
      if (this.turn === 'o') {
        this.turnCallback?.(this.grid);
      } else {
        this.playComputerTurn();
      }
    }, DELAY_MS);
  };

  private play(mark: Mark, y: number, x: number) {
    if (this.grid[y][x] !== '') {
      console.error(
        new Error(`There is already an mark in position { x: ${x}, y: ${y} }.`)
      );
      this.clean();
      return;
    }

    this.grid[y][x] = mark;
    this.subject.next([...this.grid]);
    dispatchToServer(serverActions.placeMark.create({ mark, x, y }));

    this.checkWinner(this.next);
  }

  private playComputerTurn(): void {
    const checkMark = (mark: Mark): boolean => {
      for (const line of this.grid) {
        const sortedLine = [...line].sort();

        if (
          sortedLine[0] === '' &&
          sortedLine[1] === mark &&
          sortedLine[1] === sortedLine[2]
        ) {
          this.play('x', this.grid.indexOf(line), line.indexOf(''));
          return true;
        }
      }

      for (let x = 0; x < 3; x++) {
        const column = [this.grid[0][x], this.grid[1][x], this.grid[2][x]];
        const sortedColumn = [...column].sort();

        if (
          sortedColumn[0] === '' &&
          sortedColumn[1] === mark &&
          sortedColumn[1] === sortedColumn[2]
        ) {
          this.play('x', column.indexOf(''), x);
          return true;
        }
      }

      const firstDiagonal = [this.grid[0][0], this.grid[1][1], this.grid[2][2]];
      const sortedFirstDiagonal = [...firstDiagonal].sort();

      if (
        sortedFirstDiagonal[0] === '' &&
        sortedFirstDiagonal[1] === mark &&
        sortedFirstDiagonal[1] === sortedFirstDiagonal[2]
      ) {
        this.play('x', firstDiagonal.indexOf(''), firstDiagonal.indexOf(''));
        return true;
      }

      const secondDiagonal = [
        this.grid[0][2],
        this.grid[1][1],
        this.grid[2][0],
      ];
      const sortedSecondDiagonal = [...secondDiagonal].sort();

      if (
        sortedSecondDiagonal[0] === '' &&
        sortedSecondDiagonal[1] === mark &&
        sortedSecondDiagonal[1] === sortedSecondDiagonal[2]
      ) {
        this.play(
          'x',
          secondDiagonal.indexOf(''),
          2 - secondDiagonal.indexOf('')
        );
        return true;
      }

      return false;
    };

    // We try to finish our lines first
    if (checkMark('x')) {
      return;
    }

    // Then we prevent the enemy to finish
    if (checkMark('o')) {
      return;
    }

    // Then we put our mark at a random position

    let x: number;
    let y: number;

    do {
      x = Math.floor(Math.random() * 3);
      y = Math.floor(Math.random() * 3);
    } while (this.grid[y][x] !== '');

    this.play('x', y, x);
  }

  private isFinished(): boolean {
    return this.grid.flat().every((mark) => mark !== '');
  }

  private getWinner(): Winner | undefined {
    for (const row of this.grid) {
      if (isRowFilledWithSameMark(row)) {
        const y = this.grid.indexOf(row);

        return {
          mark: row[0],
          cases: row.map((_, x) => ({ x, y })),
        };
      }
    }

    const columns: Grid = getInitialGrid();

    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        columns[y][x] = this.grid[x][y];
      }
    }

    for (const column of columns) {
      if (isRowFilledWithSameMark(column)) {
        const x = columns.indexOf(column);

        return {
          mark: column[0],
          cases: column.map((_, y) => ({ x, y })),
        };
      }
    }

    const firstDiagonal: Mark[] = ['', '', ''];
    const secondDiagonal: Mark[] = ['', '', ''];

    for (let i = 0; i < 3; i++) {
      firstDiagonal[i] = this.grid[i][i];
      secondDiagonal[i] = this.grid[i][2 - i];
    }

    if (isRowFilledWithSameMark(firstDiagonal)) {
      return {
        mark: firstDiagonal[0],
        cases: firstDiagonal.map((_, i) => ({ x: i, y: i })),
      };
    }

    if (isRowFilledWithSameMark(secondDiagonal)) {
      return {
        mark: secondDiagonal[0],
        cases: secondDiagonal.map((_, i) => ({ x: 2 - i, y: i })),
      };
    }
  }

  private reduce = (action: Action<any>): void => {
    const [type] = action;

    switch (type) {
      case clientActions.apply.type: {
        const [, grid] = action as ActionFromFactory<
          typeof clientActions.apply
        >;
        this.grid = grid;
        this.subject.next(this.grid);
        this.checkWinner();
        break;
      }

      default:
      // Ignore action
    }
  };
}

function isRowFilledWithSameMark(row: Mark[]): boolean {
  return new Set(row).size === 1 && row[0] !== '';
}
