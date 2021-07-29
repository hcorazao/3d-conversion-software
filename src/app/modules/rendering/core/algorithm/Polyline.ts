import { BoundingBox, MeshBuilder, Path3D, Vector3 } from '@babylonjs/core';
import SceneManager from '../SceneManager';

/**
 * A representation of a polyline. This is just a first stub. To be implemented.
 */
export default class Polyline extends Path3D {
  constructor(coordinates: Vector3[], firstNormal?: Vector3) {
    super(coordinates, firstNormal);
  }

  getCenterOfMass(): Vector3 {
    const center = new Vector3();
    for (const c of this.getPoints()) {
      center.addInPlace(c);
    }

    return center.scale(1 / this.getPoints().length);
  }

  /**
   * Determines whether the polyline is clock-wise (cw) or counter clock-wise (ccw) oriented.
   * @param up The up vector pointing upwards from the tooth surfaces
   * @returns true if the majority of the line segments are oriented ccw
   */
  isCCW(up: Vector3): boolean {
    // counts the cw oriented line segments
    let cw = 0;
    // counts the ccw oriented line segments
    let ccw = 0;

    const points = this.getCurve();

    // center of mass
    const c = this.getCenterOfMass();

    for (let i = 0; i < points.length - 1; i++) {
      // the tangent t_i from p_i to p_i+1
      const t = points[i + 1].subtract(points[i]);

      // the normal n_i according to a right-handed coord system
      const n = t.cross(up);

      // the direction form p_i to center of mass c
      const d = c.subtract(points[i]);

      // dot product indicating if n_i of p_i points to the center of mass c
      // if yes, then the segment between p_i and p_i+1 is cw
      // if no,  then the segment between p_i and p_i+1 is ccw
      Vector3.Dot(n, d) > 0 ? cw++ : ccw++;
    }

    // return the majority
    return ccw > cw;
  }

  /**
   * Gets bounding box
   * @todo think about returning BoundingInfo
   * @returns bounding box
   */
  getBoundingBox(): BoundingBox {
    const min = new Vector3(Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER, Number.MAX_SAFE_INTEGER);
    const max = new Vector3(Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER);

    for (const c of this.getPoints()) {
      min._x = Math.min(min._x, c._x);
      min._y = Math.min(min._y, c._y);
      min._z = Math.min(min._z, c._z);
      max._x = Math.max(max._x, c._x);
      max._y = Math.max(max._y, c._y);
      max._z = Math.max(max._z, c._z);
    }

    return new BoundingBox(min, max);
  }

  getPart(startIdx: number, endIdx: number): Polyline {
    const arr = [];
    const len = startIdx < endIdx ? endIdx - startIdx + 1 : this.getPoints().length - startIdx + endIdx + 1;

    for (let i = startIdx; i < startIdx + len; i++) {
      arr.push(this.getPoints()[i % this.getPoints().length]);
    }

    return new Polyline(arr);
  }

  getMinDistance(v: Vector3): { distance: number; closestPoint: Vector3; index: number } {
    const model = this.getMinDistanceSquared(v);
    return {
      distance: Math.sqrt(model.distanceSquared),
      closestPoint: model.closestPoint,
      index: model.index,
    };
  }

  getMinDistanceSquared(v: Vector3): { distanceSquared: number; closestPoint: Vector3; index: number } {
    let closestPoint;
    let distanceSquared = Number.MAX_SAFE_INTEGER;
    let index;
    for (let i = 0; i < this.getPoints().length; i++) {
      const w = this.getPoints()[i];
      const d2 = Vector3.DistanceSquared(v, w);
      if (distanceSquared > d2) {
        distanceSquared = d2;
        closestPoint = w;
        index = i;
      }
    }
    return { distanceSquared, closestPoint, index };
  }

  getMinDistanceXYZ(x: number, y: number, z: number): { distance: number; closestPoint: Vector3; index: number } {
    const model = this.getMinDistanceSquaredXYZ(x, y, z);
    return {
      distance: Math.sqrt(model.distanceSquared),
      closestPoint: model.closestPoint,
      index: model.index,
    };
  }

  getMinDistanceSquaredXYZ(x: number, y: number, z: number): { distanceSquared: number; closestPoint: Vector3; index: number } {
    let closestPoint;
    let distanceSquared = Number.MAX_SAFE_INTEGER;
    let index;
    for (let i = 0; i < this.getPoints().length; i++) {
      const w = this.getPoints()[i];
      const d2 = (w._x - x) * (w._x - x) + (w._y - y) * (w._y - y) + (w._z - z) * (w._z - z);
      if (distanceSquared > d2) {
        distanceSquared = d2;
        closestPoint = w;
        index = i;
      }
    }
    return { distanceSquared, closestPoint, index };
  }

  /**
   * Helper function to determin whether a point x lies between a and b. All points have to lie on a line (collinear).
   * No further checking whether all points are collinear or not.
   * @param a First point where x has to lie in between
   * @param x The point to be tested whether between a and b
   * @param b Second point where x has to lie in between
   * @returns True if x lies between a and b
   */
  private between(a: number, x: number, b: number): boolean {
    return (a < x && x < b) || (a > x && x > b);
  }

  /**
   * Projects a given vertex on the polyline. The vertex must project exactly on the tangent of two adjacent
   * control points, AND between those two points. If not possible, the nearest control point is returned.
   * @param vertex The vertex to be projected
   * @returns The distance, the projected point and the index of the closest point of the polyline
   */
  projectOnLine(vertex: Vector3): { distanceSquared: number; projection: Vector3; index: number } {
    const model = this.getMinDistanceSquared(vertex);
    const points = this.getCurve();
    const idx = points.indexOf(model.closestPoint);

    // if a vertex is too far from the line, projection is too expensive and (most likely) not necessary
    if (model.distanceSquared > 0.5) {
      return {
        projection: model.closestPoint,
        distanceSquared: model.distanceSquared,
        index: model.index,
      };
    }

    // check a couple of tangents
    for (let i = idx - 4; i < idx + 3; i++) {
      let j;
      if (i < 0) {
        j = points.length + i;
      } else {
        j = i % points.length;
      }

      // the tangent t_i from p_i to p_i+1
      const t = points[(j + 1) % points.length].subtract(points[j]);

      // the direction form p_i to vertex
      const d = vertex.subtract(points[j]);

      // A + dot(AP,AB) / dot(AB,AB) * AB
      const p = points[j].add(t.scale(Vector3.Dot(d, t) / Vector3.Dot(t, t)));

      // check whether p lies between p_i and p_i+1
      if (this.between(points[j].x, p.x, points[(j + 1) % points.length].x)) {
        return { projection: p, distanceSquared: vertex.subtract(p).lengthSquared(), index: j };
      }
    }

    // if no tangent found, return the closest point
    return {
      projection: model.closestPoint,
      distanceSquared: model.distanceSquared,
      index: model.index,
    };
  }

  distanceStatistic(): { min: number; max: number; avg: number } {
    let min = Number.MAX_SAFE_INTEGER;
    let max = 0;
    let avg = 0;

    for (let i = 0; i < this.path.length - 1; i++) {
      const d2 = Vector3.DistanceSquared(this.path[i], this.path[i + 1]);
      min = Math.min(d2, min);
      max = Math.max(d2, max);
      avg += d2;
    }
    avg /= this.path.length - 1;

    min = Math.sqrt(min);
    max = Math.sqrt(max);
    avg = Math.sqrt(avg);

    return { min, max, avg };
  }

  refineLine(maxDist: number) {
    // if (this.distanceStatistic().max < maxDist){return; }

    const newPath = [];
    const maxDist2 = maxDist * maxDist;
    for (let i = 0; i < this.path.length - 1; i++) {
      newPath.push(this.path[i]);
      const d2 = Vector3.DistanceSquared(this.path[i], this.path[i + 1]);
      if (d2 >= maxDist2) {
        newPath.push(this.path[i].add(this.path[i + 1]).scale(0.5));
      }
    }
    newPath.push(this.path[this.path.length - 1]);
    this.path = newPath;
  }

  getMinDistanceSquaredToPolyline(otherPolyLine: Polyline): { distanceSquared: number; index1: number; index2: number } {
    let distanceSquared = Number.MAX_SAFE_INTEGER;
    let index1 = -1;
    let index2 = -1;
    for (let i = 0; i < this.path.length; i++) {
      const p1 = this.path[i];
      for (let j = 0; j < otherPolyLine.path.length; j++) {
        const p2 = otherPolyLine.path[j];
        const distSquared = Vector3.DistanceSquared(p1, p2);
        if (distSquared < distanceSquared) {
          distanceSquared = distSquared;
          index1 = i;
          index2 = j;
        }
      }
    }
    return { distanceSquared, index1, index2 };
  }
}
