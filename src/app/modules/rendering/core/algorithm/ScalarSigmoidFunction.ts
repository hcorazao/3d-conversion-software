import IScalarFunction from './IScalarFunction';

/**
 * Sigmoid function
 */
export default class ScalarSigmoidFunction implements IScalarFunction {
  /**
   * Creates an instance of crscalar sigmoid function.
   * @param h1 Values between 0 and h1 evaluate to minY - values between h1 and h2 evaluate to sigmoid
   * @param h2 Values greater than h2 evaluate to maxY - values between h1 and h2 evaluate to sigmoid
   * @param [minY] Minimum value
   * @param [maxY] Maximum value
   */
  constructor(h1: number, h2: number, minY = 0, maxY = 1) {
    this.h1 = h1;
    this.h2 = h2;
    this.minY = minY;
    this.maxY = maxY;

    this.a = 1 / (h2 - h1);
    this.b = -h1 * this.a;
  }

  private h1: number;
  private h2: number;
  private a: number;
  private b: number;
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
    return (maxY - minY) * this.sigmoid(this.a * x + this.b) + minY;
  }

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-x * 10 + 5));
  }
}
