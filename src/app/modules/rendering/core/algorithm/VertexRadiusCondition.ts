import { Vector3 } from '@babylonjs/core';
import IVertexCondition from './IVertexCondition';

/**
 * Radius condition
 */
export default class VertexRadiusCondition implements IVertexCondition {
  /**
   * Creates an instance of radius condition.
   * @param center Center of
   * @param radius Todo
   * @param [distanceMap] todo
   */
  constructor(center: Vector3, radius: number, distanceMap: Map<number, number>) {
    this.center = center;
    this.radius = radius;
    this.distanceMap = distanceMap;
  }

  /**
   * Center  of radius condition
   */
  private center: Vector3;
  /**
   * Radius squared of radius condition
   */
  private radius: number;
  /**
   * Distance map of radius condition
   */
  private distanceMap: Map<number, number>;

  /**
   * Evaluates condition
   * @param vertex A given vertex v
   * @param [idx] index of vertex v
   * @returns true if condition
   */
  evaluateCondition(vertex: Vector3, idx?: number): boolean {
    return this.evaluateConditionXYZ(vertex._x, vertex._y, vertex._z, idx);
  }

  /**
   * Evaluates condition xyz
   * @param x x value of a given vertex v
   * @param y y value of a given vertex v
   * @param z z value of a given vertex v
   * @param [idx] index of vertex v
   * @returns true if condition xyz
   */
  evaluateConditionXYZ(x: number, y: number, z: number, idx: number): boolean {
    const dist = Math.sqrt(
      (this.center._x - x) * (this.center._x - x) +
        (this.center._y - y) * (this.center._y - y) +
        (this.center._z - z) * (this.center._z - z)
    );

    this.distanceMap.set(idx, dist);

    return dist < this.radius;
  }
}
