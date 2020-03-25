export function M3(...args: number[][][]): Matrix3 {
  return new Matrix3(...args);
}

export class Matrix3 extends Array<number[]> {
  constructor(...args: number[][][]) {
    super(...args[0]);
    Object.setPrototypeOf(this, Matrix3.prototype);
  }

  det(): number {
    const [[a, b, c], [d, e, f], [g, h, i]] = this;
    return (
      a * e * i + b * f * g + c * d * h - c * e * g - b * d * i - a * f * h
    );
  }

  mulMat(matrix: number[][]): Matrix3 {
    const [[a, b, c], [d, e, f], [g, h, i]] = this;

    const [[j, k, l], [m, n, o], [p, q, r]] = matrix;

    this[0] = [
      a * j + b * m + c * p,
      a * k + b * n + c * q,
      a * l + b * o + c * r,
    ];

    this[1] = [
      d * j + e * m + f * p,
      d * k + e * n + f * q,
      d * l + e * o + f * r,
    ];

    this[2] = [
      g * j + h * m + i * p,
      g * k + h * n + i * q,
      g * l + h * o + i * r,
    ];

    return this;
  }

  mulVec(vector: number[]): number[] {
    const [[a, b, c], [d, e, f], [g, h, i]] = this;

    const [j, k, l] = vector;

    return [
      a * j + b * k + c * l,
      d * j + e * k + f * l,
      g * j + h * k + i * l,
    ];
  }

  transpose(): Matrix3 {
    const [[a, b, c], [d, e, f], [g, h, i]] = this;

    this[0] = [a, d, g];
    this[1] = [b, e, h];
    this[2] = [c, f, i];

    return this;
  }
}
