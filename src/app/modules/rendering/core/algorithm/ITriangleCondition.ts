import { Vector3 } from '@babylonjs/core';
import Face from '@app/modules/geometry-processing-js/core/face';

/**
 * This is the base interface for all vertex-based conditions.
 *
 * The naming convention for derived classes shall be `Triangle` followed by a self-explanatory name followed by
 * Condition, e.g. `TriangleRadiusCondition`.
 */
export default interface ITriangleCondition {
  /**
   * The evaluate function...
   * @returns The result of the algorithm
   */
  evaluateCondition(face: Face): boolean;
}
