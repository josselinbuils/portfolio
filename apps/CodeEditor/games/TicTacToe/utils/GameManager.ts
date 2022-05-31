import { Subject } from '@josselinbuils/utils/Subject';

type Element = 'x' | 'o' | '';

export type Elements = [
  [Element, Element, Element],
  [Element, Element, Element],
  [Element, Element, Element]
];

const getInitialElements = (): Elements => [
  ['', '', ''],
  ['', '', ''],
  ['', '', ''],
];

const DELAY_MS = 1000;

export class GameManager {
  readonly subject: Subject<Elements>;
  private elements: Elements;
  private turnCallback?: (elements: Elements) => unknown;
  private timer?: number;
  private turn?: Element;

  constructor() {
    this.elements = getInitialElements();
    this.subject = new Subject(this.elements);
  }

  onMyTurn = (callback: (elements: Elements) => unknown): void => {
    this.turnCallback = callback;
  };

  setElement = (x: number, y: number) => {
    if (this.turn !== 'o') {
      throw new Error('This is not your turn!');
    }
    this.play('o', y, x);
  };

  clean = () => window.clearTimeout(this.timer);

  start = () => {
    this.clean();
    this.elements = getInitialElements();
    this.subject.next(this.elements);
    this.turn = Math.random() < 0.5 ? 'o' : 'x';

    if (this.turn === 'o') {
      this.turnCallback?.(this.elements);
    } else {
      this.playComputerTurn();
    }
  };

  private checkWinner(noWinnerCallback: () => unknown): void {
    const winner = this.getWinner();

    if (!winner && !this.isFinished()) {
      noWinnerCallback();
    } else if (winner) {
      console.log(`The winner is ${winner} ヽ(^o^)ノ`);
    } else {
      console.log(`There is no winner【ツ】`);
    }
  }

  private play(element: Element, y: number, x: number) {
    if (this.elements[y][x] !== '') {
      throw new Error(
        `There is already an element in position { x: ${x}, y: ${y} }.`
      );
    }

    this.elements[y][x] = element;
    this.update();

    this.checkWinner(() => {
      this.timer = window.setTimeout(() => {
        if (this.turn === 'o') {
          this.turnCallback?.(this.elements);
        } else {
          this.playComputerTurn();
        }
      }, DELAY_MS);
    });
  }

  private playComputerTurn(): void {
    const checkElement = (element: Element): boolean => {
      for (const line of this.elements) {
        const sortedLine = [...line].sort();

        if (
          sortedLine[0] === '' &&
          sortedLine[1] === element &&
          sortedLine[1] === sortedLine[2]
        ) {
          this.play('x', this.elements.indexOf(line), line.indexOf(''));
          return true;
        }
      }

      for (let x = 0; x < 3; x++) {
        const column = [
          this.elements[0][x],
          this.elements[1][x],
          this.elements[2][x],
        ];
        const sortedColumn = [...column].sort();

        if (
          sortedColumn[0] === '' &&
          sortedColumn[1] === element &&
          sortedColumn[1] === sortedColumn[2]
        ) {
          this.play('x', column.indexOf(''), x);
          this.update();
          return true;
        }
      }

      const firstDiagonal = [
        this.elements[0][0],
        this.elements[1][1],
        this.elements[2][2],
      ];
      const sortedFirstDiagonal = [...firstDiagonal].sort();

      if (
        sortedFirstDiagonal[0] === '' &&
        sortedFirstDiagonal[1] === element &&
        sortedFirstDiagonal[1] === sortedFirstDiagonal[2]
      ) {
        this.play('x', firstDiagonal.indexOf(''), firstDiagonal.indexOf(''));
        return true;
      }

      const secondDiagonal = [
        this.elements[0][2],
        this.elements[1][1],
        this.elements[2][0],
      ];
      const sortedSecondDiagonal = [...secondDiagonal].sort();

      if (
        sortedSecondDiagonal[0] === '' &&
        sortedSecondDiagonal[1] === element &&
        sortedSecondDiagonal[1] === sortedSecondDiagonal[2]
      ) {
        this.play(
          'x',
          secondDiagonal.indexOf(''),
          2 - secondDiagonal.indexOf('')
        );
        this.update();
        return true;
      }

      return false;
    };

    // We try to finish our lines first
    if (checkElement('x')) {
      return;
    }

    // Then we prevent the enemy to finish
    if (checkElement('o')) {
      return;
    }

    // Then we put our element at a random position

    let x: number;
    let y: number;

    do {
      x = Math.floor(Math.random() * 3);
      y = Math.floor(Math.random() * 3);
    } while (this.elements[y][x] !== '');

    this.play('x', y, x);
  }

  private isFinished(): boolean {
    return this.elements.flat().every((element) => element !== '');
  }

  private getWinner(): Element | undefined {
    for (const line of this.elements) {
      if (new Set(line).size === 1) {
        return line[0];
      }
    }

    const columns: Elements = getInitialElements();

    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) {
        columns[y][x] = this.elements[x][y];
      }
    }

    for (const column of columns) {
      if (new Set(column).size === 1) {
        return column[0];
      }
    }

    const diagonals: Element[][] = [
      ['', '', ''],
      ['', '', ''],
    ];

    for (let i = 0; i < 3; i++) {
      diagonals[0][i] = this.elements[i][i];
      diagonals[1][i] = this.elements[i][2 - i];
    }

    for (const diagonal of diagonals) {
      if (new Set(diagonal).size === 1) {
        return diagonal[0];
      }
    }
  }

  private update(): void {
    this.turn = this.turn === 'o' ? 'x' : 'o';
    this.subject.next([...this.elements]);
  }
}
