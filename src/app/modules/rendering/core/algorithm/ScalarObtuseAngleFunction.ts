import IScalarFunction from './IScalarFunction';

/**
 * Sigmoid function
 */
export default class ScalarObtuseAngleFunction implements IScalarFunction {
  /**
   * Creates an instance of crscalar sigmoid function.
   * @param h1 Values between 0 and h1 evaluate to minY - values between h1 and h2 evaluate to sigmoid
   * @param h2 Values greater than h2 evaluate to maxY - values between h1 and h2 evaluate to sigmoid
   * @param [minY] Minimum value
   * @param [maxY] Maximum value
   */
  constructor(h1: number, h2: number, minY = 0, maxY = 1, angle = 65) {
    this.h1 = 0; // always 0
    this.h2 = h2;
    this.minY = 0; // always 0
    this.maxY = maxY;

    this.m = 1 / (this.h2 - this.h1);
    this.b = -this.h1 * this.m; // always 0

    this.obt = Math.tan((angle / 180) * Math.PI);
  }

  private h1: number;
  private h2: number;
  private m: number;
  private b: number;
  private obt: number;
  private minY: number;
  private maxY: number;

  evaluate(x: number): number {
    return this.evaluateWithScaling(x, this.minY, this.maxY);
  }

  evaluateWithScaling(x: number, minY: number, maxY: number): number {
    if (x <= this.h1) {
      return minY;
    }
    if (x >= this.h2) {
      return maxY;
    }
    return (x / this.h2) * this.maxY;
    // return (maxY - minY) * this.obtuse(this.m * x + this.b) + minY;
  }

  private obtuse(x: number): number {
    return 0.1445069205 * Math.pow(x, 3) - 1.289013841 * Math.pow(x, 2) + this.obt * x;
  }
}
