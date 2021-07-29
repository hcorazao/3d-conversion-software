import { Vector3 } from '@babylonjs/core';

/**
 * This is the base interface for all vertex-based conditions.
 *
 * The naming convention for derived classes shall be `Vertex` followed by a self-explanatory name followed by
 * Condition, e.g. `VertexRadiusCondition`.
 */
export default interface IVertexCondition {
  /**
   * The evaluate function...
   * @returns The result of the algorithm
   */
  evaluateCondition(vertex: Vector3, idx?: number): boolean;

  /**
   * The evaluate function...
   * @returns The result of the algorithm
   */
  evaluateConditionXYZ(x: number, y: number, z: number, idx?: number): boolean;
}
