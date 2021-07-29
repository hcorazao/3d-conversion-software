import CRFace from '@app/modules/geometry-processing-js/core/CRFace';
import CRHalfEdgeMesh from '@app/modules/geometry-processing-js/core/CRHalfEdgeMesh';
import { Color3, Mesh, Vector3 } from '@babylonjs/core';
import Debug from '../debug/Debug';
import Polyline from './Polyline';

/**
 * A representation of a polyline. This is just a first stub. To be implemented.
 */
export default class TriangulationPolyline extends Polyline {
  constructor(coordinates: Vector3[], triangleIdx: number[], mesh: CRHalfEdgeMesh, firstNormal?: Vector3) {
    super(coordinates, firstNormal);

    this.mesh = mesh;
    this.triangleIdx = triangleIdx;
  }

  protected mesh: CRHalfEdgeMesh;
  protected triangleIdx: number[];

  static CreatePolyline(segments: TriangulationPolyline[]): TriangulationPolyline {
    const points = [];
    const triangleIdx = [];
    for (let s = 0; s < segments.length; s++) {
      const seg = segments[s].getCurve();
      for (let i = 0; i < seg.length - 1; i++) {
        points.push(seg[i]);
        triangleIdx.push(segments[s].getTriangleIndex(i));
      }
      if (s === segments.length - 1) {
        points.push(seg[seg.length - 1]);
        triangleIdx.push(segments[s].getTriangleIndex(seg.length - 1));
      }
    }
    return new TriangulationPolyline(points, triangleIdx, segments[0].mesh);
  }

  getTriangleIndex(idx: number): number {
    return this.triangleIdx[idx];
  }

  getTriangle(idx: number): CRFace {
    return this.mesh.faces[this.triangleIdx[idx]];
  }

  getTriangleIndices(): number[] {
    return this.triangleIdx;
  }

  getNormal(idx: number): Vector3 {
    const t = this.getTriangleIndex(idx);
    // return this.mesh.getFacetNormal(t);
    return this.mesh.faces[idx].calcNormal();
  }

  /**
   * Smooths triangulation polyline
   * @param lambda Damping factor [0, n)
   */
  smooth(lambda: number, closed = true) {
    if (closed) {
      this.path.pop();
    }

    // step 1: smooth all points
    const len = this.path.length;
    const factor = 1 / (lambda + 2);
    const smoothed: Vector3[] = [];
    smoothed.length = len;

    // calculate new positions according to damping factor lambda
    for (let i = 0; i < len; i++) {
      smoothed[i] = this.path[(len + i - 1) % len].add(this.path[i].scale(lambda)).add(this.path[(i + 1) % len]);
      smoothed[i].scaleInPlace(factor);
    }

    // copy over to path
    for (let i = 0; i < len; i++) {
      this.path[i].copyFrom(smoothed[i]);
    }

    // step 2: project all vectors back on mesh
    const p = new Vector3();
    for (let i = 0; i < len; i++) {
      // current face
      const f = this.mesh.faces[this.triangleIdx[i]];

      // 2a: try the current face
      if (f.pointInTriangle(this.path[i], p)) {
        this.path[i].copyFrom(p);
        continue;
      }

      // 2b: try the adjacent faces
      let success = false;
      for (const ff of f.adjacentFaces()) {
        if (ff.pointInTriangle(this.path[i], p)) {
          this.path[i].copyFrom(p);
          this.triangleIdx[i] = ff.index;
          success = true;
          break;
        }
      }
      if (success) {
        continue;
      }

      // 2c: try all adjacent faces from all adjacent vertices
      const vertices = [f.halfedge.vertex, f.halfedge.next.vertex, f.halfedge.prev.vertex];
      for (const v of vertices) {
        for (const ff of v.adjacentFaces()) {
          if (ff.pointInTriangle(this.path[i], p)) {
            this.path[i].copyFrom(p);
            this.triangleIdx[i] = ff.index;
            success = true;
            break;
          }
        }
        if (success) {
          break;
        }
      }

      if (!success) {
        // error handling: if no projection point was found, take the closest face and center the point
        // console.error('Could not project point to mesh!');
        // Debug.getInstance().debug_point(this.path[i], 0.05, new Color3(1, 1, 0));
        this.triangleIdx[i] = this.mesh.getClosestFaceIndex(this.path[i]);
        this.path[i].copyFrom(this.mesh.faces[this.triangleIdx[i]].calcCenter());
      }
    }

    if (closed) {
      this.path.push(this.path[0]);
    }

    this.update(this.path);
  }
}
