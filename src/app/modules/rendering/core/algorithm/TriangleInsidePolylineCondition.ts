import { Vector3 } from '@babylonjs/core';
import CRFace from '@app/modules/geometry-processing-js/core/CRFace';
import ITriangleCondition from './ITriangleCondition';
import TriangulationPolyline from './TriangulationPolyline';

/**
 * Todo
 */
export default class TriangleInsidePolylineCondition implements ITriangleCondition {
  /**
   * @param  polyline Todo
   * @param  distanceMap Todo
   */
  constructor(polyline: TriangulationPolyline, up: Vector3, distanceMap?: Map<number, number>) {
    this.polyline = polyline;
    this.distanceMap = distanceMap;
    this.epsilonSquared = 0.15 * 0.15;
    this.isCCW = polyline.isCCW(up);
  }

  private polyline: TriangulationPolyline;
  private distanceMap: Map<number, number>;
  private epsilonSquared: number;
  private isCCW: boolean;

  evaluateCondition(face: CRFace): boolean {
    const model = this.polyline.projectOnLine(face.calcCenter());

    // I don't like this performance-wise - ulfwil
    if (this.distanceMap) {
      this.distanceMap.set(face.index, model.distanceSquared);
    }

    if (model.distanceSquared < this.epsilonSquared) {
      const model1 = this.polyline.projectOnLine(face.halfedge.vertex);
      const model2 = this.polyline.projectOnLine(face.halfedge.next.vertex);
      const model3 = this.polyline.projectOnLine(face.halfedge.next.next.vertex);

      if (
        model1.distanceSquared < this.epsilonSquared ||
        model2.distanceSquared < this.epsilonSquared ||
        model3.distanceSquared < this.epsilonSquared
      ) {
        return false;
      } else {
        return true;
      }
    } else {
      return true;
    }
  }

  /**
   * Calculates the minimal distance from a given vertex v(x, y, z) to a polyline.
   *
   * @param  {number} x x value for a given vertex v
   * @param  {number} y y value for a given vertex v
   * @param  {number} z z value for a given vertex v
   * @returns The minimal distance squared to a given vertex v
   */
  /*
  private minimumDistanceSquaredToPolyline(x: number, y: number, z: number): number {
    let dist = 1000000;
    for (const c of this.polyline) {
      const d = (c._x - x) * (c._x - x) + (c._y - y) * (c._y - y) + (c._z - z) * (c._z - z);
      dist = Math.min(dist, d);
    }

    return dist;
  }
*/
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
