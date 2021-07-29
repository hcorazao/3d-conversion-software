/**
 * This is the base interface for all scalar-based functions.
 *
 * The naming convention for derived classes shall be `Scalar` followed by a self-explanatory name followed by
 * Transition, e.g. `ScalarSigmoidFunction`.
 */
export default interface IScalarFunction {
  /**
   * The evaluate function...
   * @returns The result of the function
   */
  evaluate(x: number): number;

  evaluateWithScaling(x: number, minY: number, maxY: number): number;
}
