import { M3 } from './Matrix3';

export function M4(...args: number[][][]): Matrix4 {
  return new Matrix4(...args);
}

export class Matrix4 extends Array<number[]> {
  private static getSubMatrix(matrix: number[][], index: number): number[][] {
    const m: number[][] = [[], [], []];
    let mc = -1;

    for (let c = 0; c < 4; c++) {
      if (c !== index) {
        mc++;
        m[0][mc] = matrix[1][c];
        m[1][mc] = matrix[2][c];
        m[2][mc] = matrix[3][c];
      }
    }

    return m;
  }

  constructor(...args: number[][][]) {
    super(...args[0]);
    Object.setPrototypeOf(this, Matrix4.prototype);
  }

  det(): number {
    let det = 0;

    for (let x = 0; x < 4; x++) {
      det +=
        Math.pow(-1, x) * this[0][x] * M3(Matrix4.getSubMatrix(this, x)).det();
    }
    return det;
  }

  // from http://blog.acipo.com/matrix-inversion-in-javascript/
  inv(): number[][] {
    if (this.length !== this[0].length) {
      throw new Error('Matrix have to be square');
    }

    const dim = this.length;
    const I: number[][] = [];
    const C: number[][] = [];

    for (let i = 0; i < dim; i += 1) {
      I[I.length] = [];
      C[C.length] = [];

      for (let j = 0; j < dim; j += 1) {
        I[i][j] = i === j ? 1 : 0;
        C[i][j] = this[i][j];
      }
    }

    for (let i = 0; i < dim; i += 1) {
      let e = C[i][i];

      if (e === 0) {
        for (let ii = i + 1; ii < dim; ii += 1) {
          if (C[ii][i] !== 0) {
            for (let j = 0; j < dim; j++) {
              e = C[i][j];
              C[i][j] = C[ii][j];
              C[ii][j] = e;
              e = I[i][j];
              I[i][j] = I[ii][j];
              I[ii][j] = e;
            }
            break;
          }
        }

        e = C[i][i];

        if (e === 0) {
          throw new Error('Matrix not invertible');
        }
      }

      for (let j = 0; j < dim; j++) {
        C[i][j] = C[i][j] / e;
        I[i][j] = I[i][j] / e;
      }

      for (let ii = 0; ii < dim; ii++) {
        if (ii === i) {
          continue;
        }

        e = C[ii][i];

        for (let j = 0; j < dim; j++) {
          C[ii][j] -= e * C[i][j];
          I[ii][j] -= e * I[i][j];
        }
      }
    }

    return I;
  }

  mulVec(vector: number[]): number[] {
    const [[a, b, c, d], [e, f, g, h], [i, j, k, l], [m, n, o, p]] = this;

    const [q, r, s, t] = vector;

    return [
      a * q + b * r + c * s + d * t,
      e * q + f * r + g * s + h * t,
      i * q + j * r + k * s + l * t,
      m * q + n * r + o * s + p * t
    ];
  }
}
