/**
 * This is the base interface for all algorithms.
 *
 * The naming convention for derived classes shall be a self-explanatory name followed by
 * Algorithm, e.g. `VertexFloodFillAlgorithm`.
 */
export default interface IAlgorithm {
  /**
   * The compute function...
   * @returns The result of the algorithm
   */
  compute(): any;
}
