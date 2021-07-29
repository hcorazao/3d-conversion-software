import { Color4, MeshBuilder, Vector3 } from '@babylonjs/core';
import SceneManager from '../SceneManager';
import Polyline from './Polyline';
import TriangulationPolyline from './TriangulationPolyline';
import IVertexCondition from './IVertexCondition';

/**
 * Todo
 */
export default class VertexInsidePolylineCondition implements IVertexCondition {
  /**
   * @param  {Vector3[]} polyline Todo
   * @param  {Map<number, number>} distanceMap Todo
   */
  constructor(polyline: TriangulationPolyline, up: Vector3, distanceMap?: Map<number, number>) {
    this.polyline = polyline;
    this.distanceMap = distanceMap;
    this.epsilonSquared = 0.3 * 0.3;
    this.isCCW = polyline.isCCW(up);
  }

  private polyline: TriangulationPolyline;
  private distanceMap: Map<number, number>;
  private epsilonSquared: number;
  private isCCW: boolean;

  /**
   * @param  {Vector3} vertex
   * @param  {number} idx?
   * @returns boolean
   */
  evaluateCondition(vertex: Vector3, idx?: number): boolean {
    const model = this.polyline.projectOnLine(vertex);

    // I don't like this performance-wise - ulfwil
    if (this.distanceMap && idx) {
      this.distanceMap.set(idx, model.distanceSquared);
    }

    if (model.distanceSquared < this.epsilonSquared) {
      if (this.insidePolyline(vertex, model.index)) {
        return true;
      } else {
        return false;
      }
    } else {
      return true;
    }
  }

  evaluateConditionXYZ(x: number, y: number, z: number, idx?: number): boolean {
    return this.evaluateCondition(new Vector3(x, y, z), idx);
  }

  /**
   * Tests whether e given vertex lies inside a closed polyline or not.
   * @param vertex The vertex to be checkt, whether he lies inside or outside the polyline
   * @param idx The index of the polyline, where the line (P(idx), P(idx+1)) is taken for the test
   * @returns true if the vertex lies inside the closed polyline
   */
  private insidePolyline(vertex: Vector3, idx: number): boolean {
    let inside = true;
    const points = this.polyline.getCurve();

    // the tangent t_i from p_i to p_i+1
    const t = points[(idx + 1) % points.length].subtract(points[idx]);

    // the up vector is the triangle normal
    const up = this.polyline.getNormal(idx);

    // the normal n_i according to a right-handed coord system
    const n = t.cross(up);

    // the direction form p_i to vertex
    const d = vertex.subtract(points[idx]);

    // depending on cw or ccw, vertex is either inside or outside
    if (this.isCCW) {
      Vector3.Dot(n, d) < 0 ? (inside = true) : (inside = false);
    } else {
      Vector3.Dot(n, d) > 0 ? (inside = true) : (inside = false);
    }

    return inside;
  }
}
